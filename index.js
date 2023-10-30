const { env } = require('process');

const { generateFilesFromSpreadsheet } = require('./lib/generateFilesFromSpreadsheet');

const SPREAD_SHEET_ID = '1tzuc3vxLVPo8wSOvOOSDwsH7yMcQSZeE9XULntzAlag';
const DEFAULT_API_KEY = env.API_KEY;
const DEFAULT_OUTPUT_DIR = './locales';
const DEFAULT_FORMAT = 'json';
const DEFAULT_BEAUTIFY = 2;

generateFilesFromSpreadsheet(
	SPREAD_SHEET_ID,
  DEFAULT_API_KEY,
	DEFAULT_OUTPUT_DIR,
	DEFAULT_FORMAT,
	DEFAULT_BEAUTIFY,
);
