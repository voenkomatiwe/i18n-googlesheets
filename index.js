const path = require('path');
const process = require('process');

const { generateFilesFromSpreadsheet } = require('../lib/generateFilesFromSpreadsheet');

const SPREAD_SHEET_ID = '1u2eumiwPFT4EevSiHDQCq83xDVkDyjehz5IJ0IfooJA'
const DEFAULT_CREDENTIALS = path.join(process.cwd(), 'credentials.json')
const DEFAULT_TOKEN = path.join(process.cwd(), 'token.json')
const DEFAULT_RANGE = 'Sheet1'
const DEFAULT_KEY_INDEX = 0
const DEFAULT_LANG_INDEX = 1
const DEFAULT_OUTPUT_DIR = './locales'
const DEFAULT_FORMAT = 'json'
const DEFAULT_BEAUTIFY = 4

generateFilesFromSpreadsheet(
	SPREAD_SHEET_ID,
	DEFAULT_CREDENTIALS,
	DEFAULT_TOKEN,
	DEFAULT_RANGE,
	DEFAULT_KEY_INDEX,
	DEFAULT_LANG_INDEX,
	DEFAULT_OUTPUT_DIR,
	DEFAULT_FORMAT,
	DEFAULT_BEAUTIFY,
)