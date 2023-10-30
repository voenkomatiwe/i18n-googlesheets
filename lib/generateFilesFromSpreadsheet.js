'use strict'

const fs = require('fs')
const axios = require('axios');
const ISOLanguages = require('./constants');

const GOOGLE_SHEET_API = 'https://sheets.googleapis.com/v4/spreadsheets/';

const FORMAT_CONFIG = {
	cjs: {
		FILE_EXTENSION: 'js',
		DATA_PREFIX: 'module.exports = ',
	},
	esm: {
		FILE_EXTENSION: 'js',
		DATA_PREFIX: 'export default ',
	},
	json: {
		FILE_EXTENSION: 'json',
		DATA_PREFIX: '',
	},
}

/**
 * Format error message to display
 * @private
 *
 * @param {string} message - Custom message
 * @param {string} error - System error
 * @returns {string} Fromatted error message
 */
function formatErrorMessage(message, error) {
	return error ? `${message}:\n\t${error}` : message
}

/**
 * Convert string to camel case
 * @private
 *
 * @param {string} string - string
 * @returns {string} Converted string
 */
function toCamelCase(string) {
  return string.replace(/(\s|-|_)(\w)/g, (_, separator, letter) => letter.toUpperCase());
}

/**
 * Get range data of spreadsheet using Google Sheets API
 * @private
 *
 * @param {string} spreadsheetId - Id of spreadsheet to parse
 * @returns {Promise<Object[]>} Rows data of spreadsheet
 */
async function getListOfSheets(spreadsheetId, apiKey) {
	try {
    const url = `${GOOGLE_SHEET_API}${spreadsheetId}?key=${apiKey}`;
    console.info(`Waiting for a list of sheets at the link: ${url}`);
		const result = await axios.get(url);
    const list = result.data.sheets.map((el) => el.properties.title);
    console.info(`List by spreadsheetId(${spreadsheetId}): ${list}`);
		return list
	} catch (err) {
		throw new Error(formatErrorMessage(`Error loading spreadsheet ${spreadsheetId}`, err))
	}
}

/**
 * Get rows data of spreadsheet using Google Sheets API
 * @private
 *
 * @param {string} spreadsheetId - Id of spreadsheet to parse
 * @param {string} range - Range of cells to parse
 * @returns {Promise<Object[]>} Rows data of spreadsheet
 */
async function getSpreadsheetRows(spreadsheetId, range, apiKey) {
	try {
    const url = `${GOOGLE_SHEET_API}${spreadsheetId}/values/${range}?key=${apiKey}`;
    console.info(`Waiting for a data at the \nlink: ${url} \nby range: ${range}`);
		const result = await axios.get(url);
		return result.data.values
	} catch (err) {
		throw new Error(formatErrorMessage(`Error loading spreadsheet ${spreadsheetId} with range ${range}`, err))
	}
}

/**
 * Generate i18n files parsing rows data of spreadsheet
 * @private
 *
 * @param {Object[]} rows - List of rows
 * @param {string} range - Range of cells to parse
 * @param {string} outputDir - Path of output directory
 * @param {string} format - Format of generated files
 * @param {number} beautify - Number of spaces to insert white space
 * @returns {Promise} No data
 */
async function generateFiles(rows, range, outputDir, format, beautify) {
	if (rows.length === 0) {
		throw new Error(formatErrorMessage('No data found in spreadsheet'))
	}
  const lang = ISOLanguages.find(el => el.name.includes(range));
  if (!lang) {
    console.error(formatErrorMessage(`Incorrect ISO language name: ${range}\n`))
    return
	}
  const translations = {};
  for (let i = 1; i < rows.length; i++) {
    const [namespace, key, translate] = rows[i];
    if (namespace && key && translate) {
      const camelCaseNamespace = toCamelCase(namespace);
      const camelCaseKey = toCamelCase(key);
      if (!translations[camelCaseNamespace]) {
        translations[camelCaseNamespace] = {};
      }
      translations[camelCaseNamespace][camelCaseKey] = translate;
    }
  }

	// Create output directory
	if (!fs.existsSync(outputDir)) {
		console.info(`Creating ${outputDir} output directory`)

		try {
			fs.mkdirSync(outputDir)
			console.info(`${outputDir} has been created`)
		} catch (err) {
			throw new Error(formatErrorMessage(`Error creating directory ${outputDir}`, err))
		}
	}

	// Write file for each language
  const formatConfig = FORMAT_CONFIG[format]
  const file = `${outputDir}/${lang.code}.${formatConfig.FILE_EXTENSION}`
  const data = `${formatConfig.DATA_PREFIX}${JSON.stringify(translations, null, beautify)}`

  try {
    fs.writeFileSync(file, data)
    console.info(`${file} has been created\n\n`)
  } catch (err) {
    console.error(formatErrorMessage(`Error writing file ${file}`, err))
  }
}

module.exports = {
	/**
	 * Generate files parsing Google Sheets spreadsheet
	 *
	 * @param {string} spreadsheetId - Id of spreadsheet to parse
	 * @param {string} apiKey - User`s API key
	 * @param {string} outputDir - Path of output directory
	 * @param {string} format - Format of generated files
 	 * @param {number} beautify - Number of spaces to insert white space
	 * @returns {Promise} No data
	 */
	async generateFilesFromSpreadsheet(
		spreadsheetId,
    apiKey,
		outputDir,
		format,
		beautify,
	) {
		try {
			if (!spreadsheetId || !apiKey) {
        if (!spreadsheetId && !apiKey) {
          throw new Error("Spreadsheet ID and API key are required");
        } else if (!spreadsheetId) {
          throw new Error("Spreadsheet ID is required");
        } else {
          throw new Error("API key is required");
        }
      }
			const lists = await getListOfSheets(spreadsheetId, apiKey)
      if (!lists.length) throw new Error(formatErrorMessage('Empty list of sheets'))

      for (const el of lists) {
        const rows = await getSpreadsheetRows(spreadsheetId, el, apiKey);
        await generateFiles(rows, el, outputDir, format, beautify);
      }
		} catch (error) {
			console.error(error.message)
		}
	},
}