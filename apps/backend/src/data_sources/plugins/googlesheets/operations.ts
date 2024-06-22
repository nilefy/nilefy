import { Logger } from '@nestjs/common';
import { QueryT } from './types';
import { FetchXError } from './errors';

async function makeRequestToReadValues(
  spreadSheetId: string,
  /**
   * sheet name
   */
  sheet: number,
  range: string,
  authHeader: RequestInit['headers'],
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${sheet || ''}!${range}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeader,
  });

  if (!response.ok) {
    const json = await response.json();
    throw new FetchXError(
      'Failed to fetch data',
      json.error.code,
      json.error.message,
    );
  }

  return await response.json();
}

async function makeRequestToAppendValues(
  spreadSheetId: string,
  /**
   * sheet name
   */
  sheet: string,
  requestBody: string,
  authHeader: RequestInit['headers'],
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${sheet || ''}!A:Z:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new FetchXError(
      'Failed to append data',
      json.error.code,
      json.error.message,
    );
  }

  return await response.json();
}

async function makeRequestToDeleteRows(
  spreadSheetId: QueryT['spreadsheet_id'],
  requestBody: string,
  authHeader: RequestInit['headers'],
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}:batchUpdate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
    },
    body: requestBody,
  });

  Logger.error({ response });

  if (!response.ok) {
    const json = await response.json();
    throw new FetchXError(
      'Failed to delete rows',
      json.error.code,
      json.error.message,
    );
  }
  return await response.json();
}

async function makeRequestToBatchUpdateValues(
  spreadSheetId: QueryT['spreadsheet_id'],
  requestBody: string,
  authHeader: RequestInit['headers'],
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values:batchUpdate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new FetchXError(
      'Failed to batch update values',
      json.error.code,
      json.error.message,
    );
  }

  return await response.json();
}

async function makeRequestToLookUpCellValues(
  spreadSheetId: string,
  range: string,
  authHeader: RequestInit['headers'],
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?majorDimension=COLUMNS`;

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeader,
  });

  if (!response.ok) {
    const json = await response.json();
    throw new FetchXError(
      'Failed to look up cell values',
      json.error.code,
      json.error.message,
    );
  }

  return await response.json();
}

export async function batchUpdateToSheet(
  spreadSheetId: string,
  spreadsheetRange: string = 'A1:Z500',
  sheet: number,
  requestBody: string,
  filterData: any,
  filterOperator: string,
  authHeader: RequestInit['headers'],
) {
  const lookUpData = await lookUpSheetData(
    spreadSheetId,
    spreadsheetRange,
    sheet,
    authHeader,
  );

  const body = await makeRequestBodyToBatchUpdate(
    requestBody,
    filterData,
    filterOperator,
    lookUpData,
  );

  const _data = body.map((data) => {
    return {
      majorDimension: 'ROWS',
      range: `${sheet}!${data.cellIndex}`,
      values: [[data.cellValue]],
    };
  });

  const reqBody = {
    data: _data,
    valueInputOption: 'USER_ENTERED',
    includeValuesInResponse: true,
  };

  if (!reqBody.data) return new Error('No data to update');

  const response = await makeRequestToBatchUpdateValues(
    spreadSheetId,
    reqBody,
    authHeader,
  );

  return response;
}

export async function readDataFromSheet(
  spreadSheetId: string,
  sheet: number,
  range: string,
  authHeader: any,
) {
  const data = await makeRequestToReadValues(
    spreadSheetId,
    sheet,
    range,
    authHeader,
  );
  let headers = [];
  let values = [];
  const result = [];
  const dataValues = data['values'];

  if (dataValues) {
    headers = dataValues[0];
    values =
      dataValues.length > 1 ? dataValues.slice(1, dataValues.length) : [];

    for (const value of values) {
      const row = {};
      for (const [index, header] of headers.entries()) {
        row[header] = value[index];
      }
      result.push(row);
    }
  }

  return result;
}

async function appendDataToSheet(
  spreadSheetId: string,
  sheet: number,
  rows: any,
  authHeader: any,
) {
  const parsedRows = rows;
  const sheetData = await makeRequestToReadValues(
    spreadSheetId,
    sheet,
    'A1:Z1',
    authHeader,
  );
  const fullSheetHeaders = sheetData['values'][0];
  const rowsToAppend = parsedRows.map((row) => {
    const headersForAppendingRow = Object.keys(row);
    const rowData = [];

    headersForAppendingRow.forEach((appendDataHeader) => {
      const indexToInsert = fullSheetHeaders.indexOf(appendDataHeader);
      if (indexToInsert >= 0) {
        rowData[indexToInsert] = row[appendDataHeader];
      }
    });

    return rowData;
  });

  const requestBody = { values: rowsToAppend };
  const response = await makeRequestToAppendValues(
    spreadSheetId,
    sheet,
    requestBody,
    authHeader,
  );

  return response;
}

async function deleteDataFromSheet(
  spreadSheetId: string,
  sheet: number,
  rowIndex: number,
  authHeader: any,
) {
  const requestBody = {
    requests: [
      {
        deleteDimension: {
          range: {
            sheetId: +sheet,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      },
    ],
  };
  Logger.debug({ requestBody });
  const response = await makeRequestToDeleteRows(
    spreadSheetId,
    JSON.stringify(requestBody),
    authHeader,
  );

  return response;
}

export async function readData(
  spreadSheetId: string,
  spreadsheetRange: string,
  sheet: number,
  authHeader: RequestInit['headers'],
): Promise<any[]> {
  return await readDataFromSheet(
    spreadSheetId,
    sheet,
    spreadsheetRange,
    authHeader,
  );
}

export async function appendData(
  spreadSheetId: string,
  sheet: number,
  rows: any[],
  authHeader: RequestInit['headers'],
): Promise<any> {
  console.log('append data , rows' + rows);
  return await appendDataToSheet(spreadSheetId, sheet, rows, authHeader);
}

export async function deleteData(
  spreadSheetId: string,
  sheet: number,
  rowIndex: number,
  authHeader: RequestInit['headers'],
): Promise<any> {
  return await deleteDataFromSheet(spreadSheetId, sheet, rowIndex, authHeader);
}

async function lookUpSheetData(
  spreadSheetId: string,
  spreadsheetRange: string,
  sheet: number,
  authHeader: RequestInit['headers'],
) {
  const range = `${sheet}!${spreadsheetRange}`;
  const responseLookUpCellValues = await makeRequestToLookUpCellValues(
    spreadSheetId,
    range,
    authHeader,
  );
  const data = await responseLookUpCellValues['values'];

  return data;
}

//* utils
const getInputKeys = (inputBody, data) => {
  const keys = Object.keys(inputBody);
  const arr = [];
  keys.map((key) =>
    data.forEach((val, index) => {
      if (val[0] === key) {
        let keyIndex = '';
        if (index >= 26) {
          keyIndex = numberToLetters(index);
        } else {
          keyIndex = `${String.fromCharCode(65 + index)}`;
        }
        arr.push({ col: val[0], colIndex: keyIndex });
      }
    }),
  );
  return arr;
};

const getRowsIndex = (inputFilter, filterOperator, response) => {
  const filterWithOperator = (type, array, value) => {
    switch (type) {
      case '===':
        return array === value;
      default:
        return false;
    }
  };
  const columnValues = response
    .filter((column) => column[0] === inputFilter.key)
    .flat();

  if (columnValues.length === 0) {
    return -1;
  }

  const rowIndex = [];

  columnValues.forEach((col, index) => {
    const inputValue =
      typeof inputFilter.value !== 'string'
        ? JSON.stringify(inputFilter.value)
        : inputFilter.value;
    const isEqual = filterWithOperator(filterOperator, col, inputValue);
    if (isEqual) {
      rowIndex.push(index + 1);
    }
  });
  if (rowIndex.length === 0) {
    return -1;
  }

  return rowIndex;
};

function numberToLetters(num) {
  let letters = '';
  while (num >= 0) {
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
    num = Math.floor(num / 26) - 1;
  }
  return letters;
}

export const makeRequestBodyToBatchUpdate = (
  requestBody,
  filterCondition,
  filterOperator,
  data,
) => {
  const rowsIndexes = getRowsIndex(
    filterCondition,
    filterOperator,
    data,
  ) as any[];
  const colIndexes = getInputKeys(requestBody, data);

  const updateCellIndexes = [];
  colIndexes.map((col) => {
    rowsIndexes.map((rowIndex) =>
      updateCellIndexes.push({
        ...col,
        cellIndex: `${col.colIndex}${rowIndex}`,
      }),
    );
  });

  const body = [];
  Object.entries(requestBody).map((item) => {
    updateCellIndexes.map((cell) => {
      if (item[0] === cell.col) {
        body.push({ cellValue: item[1], cellIndex: cell.cellIndex });
      }
    });
  });

  return body;
};
