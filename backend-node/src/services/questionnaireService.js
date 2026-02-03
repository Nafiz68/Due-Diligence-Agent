import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';
import pdf from 'pdf-parse';
import Questionnaire from '../models/Questionnaire.js';
import Question from '../models/Question.js';

/**
 * Parse CSV file
 */
const parseCSV = async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    return records;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error('Failed to parse CSV file');
  }
};

/**
 * Parse Excel file
 */
const parseExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data;
  } catch (error) {
    console.error('Error parsing Excel:', error);
    throw new Error('Failed to parse Excel file');
  }
};

/**
 * Parse PDF file and extract questions
 */
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    // Extract questions using pattern matching
    // Common patterns: numbered questions, bullet points, or lines ending with "?"
    const questions = [];
    
    // Split by lines and identify questions
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentCategory = 'General';
    let questionNumber = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect category headers (lines in ALL CAPS or starting with Roman numerals)
      if (line === line.toUpperCase() && line.length > 5 && line.length < 100 && !line.includes('?')) {
        currentCategory = line;
        continue;
      }
      
      // Detect questions by various patterns
      const isQuestion = 
        line.includes('?') || // Contains question mark
        /^\d+[\.)]\s/.test(line) || // Starts with number and period/parenthesis
        /^[a-z][\.)]\s/.test(line) || // Starts with letter and period/parenthesis
        /^(Question|Q\d+|Item)\s*\d*[:\-]?\s/i.test(line); // Starts with "Question", "Q", or "Item"
      
      if (isQuestion) {
        // Clean up the question text
        let questionText = line
          .replace(/^\d+[\.)]\s*/, '') // Remove leading numbers
          .replace(/^[a-z][\.)]\s*/, '') // Remove leading letters
          .replace(/^(Question|Q\d+|Item)\s*\d*[:\-]?\s*/i, '') // Remove question prefixes
          .trim();
        
        // If line is too short, might be part of previous line
        if (questionText.length < 10 && i > 0) {
          continue;
        }
        
        // Combine multi-line questions
        while (i + 1 < lines.length && !lines[i + 1].includes('?') && 
               !/^\d+[\.)]\s/.test(lines[i + 1]) && lines[i + 1].length < 200) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.length > 0 && nextLine !== nextLine.toUpperCase()) {
            questionText += ' ' + nextLine;
            i++;
          } else {
            break;
          }
        }
        
        if (questionText.length >= 10) { // Minimum question length
          questions.push({
            question: questionText,
            Question: questionText,
            questionText: questionText,
            number: questionNumber.toString(),
            questionNumber: questionNumber.toString(),
            category: currentCategory,
            Category: currentCategory,
          });
          questionNumber++;
        }
      }
    }
    
    console.log(`Extracted ${questions.length} questions from PDF`);
    
    if (questions.length === 0) {
      // Fallback: treat each line with > 20 chars as potential question
      let fallbackQuestions = lines
        .filter(line => line.length > 20 && line.length < 500)
        .map((line, idx) => ({
          question: line,
          Question: line,
          questionText: line,
          number: (idx + 1).toString(),
          questionNumber: (idx + 1).toString(),
          category: 'General',
          Category: 'General',
        }));
      
      console.log(`Using fallback extraction: ${fallbackQuestions.length} questions`);
      return fallbackQuestions.slice(0, 200); // Limit to 200 questions
    }

    return questions;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Normalize parsed data to standard question format
 */
const normalizeQuestions = (rawData) => {
  return rawData.map((row, index) => {
    // Flexible field mapping - supports various column names
    const questionText =
      row.question ||
      row.Question ||
      row.questionText ||
      row['Question Text'] ||
      row.text ||
      '';

    const questionNumber =
      row.number ||
      row.Number ||
      row.questionNumber ||
      row['Question Number'] ||
      (index + 1).toString();

    const category =
      row.category ||
      row.Category ||
      row.section ||
      row.Section ||
      'General';

    const subcategory =
      row.subcategory ||
      row.Subcategory ||
      row.subsection ||
      row.Subsection ||
      '';

    const expectedAnswerType =
      row.answerType ||
      row.AnswerType ||
      row.type ||
      row.Type ||
      'text';

    const isRequired =
      row.required === 'true' ||
      row.Required === 'true' ||
      row.required === true ||
      row.Required === true ||
      false;

    return {
      questionText,
      questionNumber,
      category,
      subcategory,
      expectedAnswerType: normalizeAnswerType(expectedAnswerType),
      isRequired,
      metadata: row,
    };
  });
};

/**
 * Normalize answer type to supported values
 */
const normalizeAnswerType = (type) => {
  const typeStr = type.toString().toLowerCase();

  if (typeStr.includes('yes') || typeStr.includes('no')) return 'yes_no';
  if (typeStr.includes('multiple') || typeStr.includes('choice'))
    return 'multiple_choice';
  if (typeStr.includes('number') || typeStr.includes('numeric'))
    return 'numeric';
  if (typeStr.includes('date')) return 'date';

  return 'text';
};

/**
 * Parse questionnaire file and create questions
 */
export const parseQuestionnaire = async (questionnaireId) => {
  try {
    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    // Update status to processing
    questionnaire.status = 'processing';
    await questionnaire.save();

    // Parse file based on type
    let rawData;
    if (questionnaire.fileType === 'csv') {
      rawData = await parseCSV(questionnaire.filePath);
    } else if (['xlsx', 'xls'].includes(questionnaire.fileType)) {
      rawData = await parseExcel(questionnaire.filePath);
    } else if (questionnaire.fileType === 'pdf') {
      rawData = await parsePDF(questionnaire.filePath);
    } else {
      throw new Error('Unsupported file type');
    }

    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in file');
    }

    // Normalize questions
    const normalizedQuestions = normalizeQuestions(rawData);

    // Create questions in database
    const questions = await Question.insertMany(
      normalizedQuestions.map((q) => ({
        ...q,
        questionnaire: questionnaireId,
      }))
    );

    // Update questionnaire
    questionnaire.status = 'completed';
    questionnaire.questionCount = questions.length;
    await questionnaire.save();

    return {
      questionnaire,
      questions,
    };
  } catch (error) {
    console.error('Error parsing questionnaire:', error);

    // Update questionnaire status to failed
    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (questionnaire) {
      questionnaire.status = 'failed';
      questionnaire.error = error.message;
      await questionnaire.save();
    }

    throw error;
  }
};

/**
 * Get questions for a questionnaire
 */
export const getQuestions = async (questionnaireId, filters = {}) => {
  try {
    const query = { questionnaire: questionnaireId };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    const questions = await Question.find(query).sort({ questionNumber: 1 });

    return questions;
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

export default {
  parseQuestionnaire,
  getQuestions,
};
