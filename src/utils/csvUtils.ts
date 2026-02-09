/**
 * CSV 工具模組
 * 提供 UTF-8 BOM 編碼的 CSV 讀寫功能
 */

// UTF-8 BOM 標記，確保 Excel 正確識別中文
const UTF8_BOM = '\uFEFF';

// CSV 特殊字符轉義
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  let str = String(value);
  
  // 如果包含特殊字符，用雙引號包圍並轉義內部的雙引號
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  
  return str;
};

// 解析 CSV 單元格
const unescapeCSV = (value: string): string => {
  if (!value) return '';
  
  // 去除首尾空格
  value = value.trim();
  
  // 如果由雙引號包圍，去除並還原內部轉義
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1).replace(/""/g, '"');
  }
  
  return value;
};

// 將物件陣列轉換為 CSV 字串
export const objectsToCSV = <T extends Record<string, any>>(
  data: T[],
  headers?: { key: keyof T; label: string }[]
): string => {
  if (data.length === 0) {
    return UTF8_BOM;
  }
  
  // 如果沒有提供 headers，自動從第一筆資料提取
  const dataHeaders = headers || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }));
  
  // CSV 標題行
  const headerRow = dataHeaders.map(h => escapeCSV(h.label)).join(',');
  
  // CSV 資料行
  const rows = data.map(item => {
    return dataHeaders
      .map(header => {
        const value = item[header.key];
        // 處理巢狀物件或陣列（轉為 JSON 字串）
        if (typeof value === 'object' && value !== null) {
          return escapeCSV(JSON.stringify(value));
        }
        return escapeCSV(value);
      })
      .join(',');
  });
  
  return UTF8_BOM + [headerRow, ...rows].join('\n');
};

// 將 CSV 字串解析為物件陣列
export const csvToObjects = <T extends Record<string, any>>(
  csvText: string,
  headerMap?: { [key: string]: string }
): T[] => {
  // 移除 BOM
  let text = csvText;
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.substring(1);
  }
  
  // 分割行
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // 轉義的雙引號
        currentLine += char;
        i++; // 跳過下一個雙引號
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      if (char === '\r' && nextChar === '\n') {
        i++; // 跳過 \n
      }
    } else {
      currentLine += char;
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  if (lines.length === 0) {
    return [];
  }
  
  // 解析標題
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(unescapeCSV(current));
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(unescapeCSV(current));
    return result;
  };
  
  const headers = parseLine(lines[0]);
  
  // 解析資料行
  const results: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const key = headerMap?.[header] || header;
      let value: any = values[index] || '';
      
      // 嘗試解析 JSON（用於巢狀物件/陣列）
      if (value.startsWith('{') || value.startsWith('[')) {
        try {
          value = JSON.parse(value);
        } catch {
          // 保持為字串
        }
      }
      
      // 嘗試解析數字
      if (value !== '' && !isNaN(Number(value)) && !value.includes(' ')) {
        value = Number(value);
      }
      
      // 嘗試解析布林值
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      obj[key] = value;
    });
    
    results.push(obj as T);
  }
  
  return results;
};

// 下載 CSV 檔案
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// 讀取 CSV 檔案
export const readCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        resolve(content);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('讀取檔案失敗'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

// 使用 File System Access API 儲存檔案（如果支援）
export const saveCSVToFile = async (
  csvContent: string,
  suggestedName: string
): Promise<boolean> => {
  // @ts-ignore - File System Access API 類型定義可能不完整
  if ('showSaveFilePicker' in window) {
    try {
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'CSV 檔案',
            accept: { 'text/csv': ['.csv'] },
          },
        ],
      });
      
      const writable = await handle.createWritable();
      await writable.write(csvContent);
      await writable.close();
      return true;
    } catch (error) {
      // 使用者取消或錯誤，回退到下載方式
      console.warn('File System Access API 失敗，使用下載方式:', error);
    }
  }
  
  // 回退到下載方式
  downloadCSV(csvContent, suggestedName);
  return false;
};

// 使用 File System Access API 開啟檔案（如果支援）
export const openCSVFile = async (): Promise<{ content: string; filename: string } | null> => {
  // @ts-ignore
  if ('showOpenFilePicker' in window) {
    try {
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'CSV 檔案',
            accept: { 'text/csv': ['.csv'] },
          },
        ],
        multiple: false,
      });
      
      const file = await handle.getFile();
      const content = await readCSVFile(file);
      return { content, filename: file.name };
    } catch (error) {
      console.warn('File System Access API 失敗:', error);
      return null;
    }
  }
  
  return null;
};

export default {
  objectsToCSV,
  csvToObjects,
  downloadCSV,
  readCSVFile,
  saveCSVToFile,
  openCSVFile,
};
