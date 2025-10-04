import * as ExcelJS from 'exceljs';

export interface OrderData {
  orderId: string;
  createdAt: string | Date;
  status: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    product: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    grandTotal: number;
    amountReceived: number;
    advanceUsed: number;
    balance: number;
  };
  dueDate?: string | Date;
  notes?: string;
  payment?: {
    method: string;
  };
}

class PDFGenerator {
  private customCellMappings: { [cellRef: string]: any } = {};

  /**
   * Set custom cell mappings for Excel generation
   */
  setCustomCellMappings(mappings: { [cellRef: string]: any }): void {
    this.customCellMappings = { ...mappings };
    console.log('📍 Set custom cell mappings:', Object.keys(mappings));
  }

  /**
   * Add a single cell mapping
   */
  addCellMapping(cellRef: string, value: any): void {
    this.customCellMappings[cellRef] = value;
    console.log(`📍 Added cell mapping: ${cellRef} = ${value}`);
  }

  /**
   * Fill Excel template with custom data and cell mappings using ExcelJS
   */
  async fillExcelTemplate(data: any, cellMappings: { [cellRef: string]: any }): Promise<void> {
    console.log('🚀 Starting Excel template filling with ExcelJS...');
    console.log('📊 Data to fill:', data);
    console.log('📍 Cell mappings:', cellMappings);
    
    try {
      // Step 1: Load the Excel template
      console.log('📄 Step 1: Loading Excel template...');
      const templateResponse = await fetch('/excelTemplate/templete.xlsx');
      
      if (!templateResponse.ok) {
        throw new Error(`Failed to fetch template: ${templateResponse.status} ${templateResponse.statusText}`);
      }
      
      const templateBuffer = await templateResponse.arrayBuffer();
      console.log('✅ Template loaded successfully, size:', templateBuffer.byteLength, 'bytes');
      
      // Step 2: Parse with ExcelJS
      console.log('📊 Step 2: Parsing Excel file with ExcelJS...');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      console.log('✅ Excel workbook parsed with ExcelJS, worksheets:', workbook.worksheets.length);
      
      // Step 3: Get the first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheet found in template');
      }
      console.log('📋 Using worksheet:', worksheet.name);
      
      // Step 4: Fill the template with provided data (preserving formatting)
      console.log('✏️ Step 3: Filling template with data (preserving formatting)...');
      console.log('📊 Data object:', data);
      console.log('📍 Cell mappings:', cellMappings);
      
      try {
        // Fill data directly into the worksheet to preserve formatting
        this.fillWorksheetWithExcelJS(worksheet, cellMappings);
        console.log('✅ Template filled with data while preserving formatting');
      } catch (fillError) {
        console.error('❌ Error in fillWorksheetWithExcelJS:', fillError);
        throw fillError;
      }
      
      // Step 5: Download Excel file
      console.log('📄 Step 4: Downloading filled Excel file...');
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create blob and download
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Filled_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Excel file downloaded successfully!');
      console.log('🎉 Excel template filling completed successfully!');
      
    } catch (error) {
      console.error('❌ Error filling Excel template:', error);
      throw error;
    }
  }

  /**
   * Fill worksheet with data using ExcelJS (preserves formatting)
   */
  private fillWorksheetWithExcelJS(worksheet: ExcelJS.Worksheet, cellMappings: { [cellRef: string]: any }): void {
    console.log('🔄 Filling worksheet with ExcelJS...');
    
    let filledCells = 0;
    
    // Fill specific cells with provided data
    Object.entries(cellMappings).forEach(([cellRef, value]) => {
      try {
        console.log(`🔍 Processing cell ${cellRef} → value: ${value}`);
        
        // Get the cell and set its value (preserves all existing formatting)
        const cell = worksheet.getCell(cellRef);
        cell.value = value;
        
        filledCells++;
        console.log(`✅ Filled cell ${cellRef}: '${cell.value}'`);
      } catch (error) {
        console.error(`❌ Error filling cell ${cellRef}:`, error);
      }
    });
    
    console.log(`✅ Filled ${filledCells} cells in worksheet (formatting preserved)`);
  }

  /**
   * Download original template using ExcelJS (preserves styling)
   */
  async downloadOriginalTemplate(): Promise<void> {
    console.log('🚀 Starting original template download with ExcelJS...');
    
    try {
      // Step 1: Load the Excel template
      console.log('📄 Step 1: Loading Excel template...');
      const templateResponse = await fetch('/excelTemplate/templete.xlsx');
      
      if (!templateResponse.ok) {
        throw new Error(`Failed to fetch template: ${templateResponse.status} ${templateResponse.statusText}`);
      }
      
      const templateBuffer = await templateResponse.arrayBuffer();
      console.log('✅ Template loaded successfully, size:', templateBuffer.byteLength, 'bytes');
      
      // Step 2: Parse with ExcelJS
      console.log('📊 Step 2: Parsing Excel file with ExcelJS...');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      console.log('✅ Excel workbook parsed with ExcelJS, worksheets:', workbook.worksheets.length);
      
      // Step 3: Get the first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheet found in template');
      }
      console.log('📋 Using worksheet:', worksheet.name);
      
      // Step 4: Log some cell information
      console.log('📊 Sample cells from template:');
      const sampleCells = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'J1', 'J5'];
      sampleCells.forEach(cellRef => {
        const cell = worksheet.getCell(cellRef);
        if (cell.value) {
          console.log(`   ${cellRef}: '${cell.value}' (type: ${typeof cell.value})`);
        } else {
          console.log(`   ${cellRef}: [empty]`);
        }
      });
      
      // Step 5: Download the original template
      console.log('📄 Step 3: Downloading original template with ExcelJS...');
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create blob and download
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Original_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Excel file downloaded successfully with ExcelJS!');
      console.log('🎉 Original template download completed successfully!');
      
    } catch (error) {
      console.error('❌ Error downloading original template with ExcelJS:', error);
      throw error;
    }
  }

  /**
   * Read and log Excel template file (for debugging)
   */
  async readExcelTemplate(): Promise<void> {
    console.log('🚀 Starting Excel template reading...');
    
    try {
      // Step 1: Load the Excel template
      console.log('📄 Step 1: Loading Excel template...');
      const templateResponse = await fetch('/excelTemplate/templete.xlsx');
      
      if (!templateResponse.ok) {
        throw new Error(`Failed to fetch template: ${templateResponse.status} ${templateResponse.statusText}`);
      }
      
      const templateBuffer = await templateResponse.arrayBuffer();
      console.log('✅ Template loaded successfully, size:', templateBuffer.byteLength, 'bytes');
      
      // Step 2: Parse with ExcelJS
      console.log('📊 Step 2: Parsing Excel file with ExcelJS...');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      console.log('✅ Excel workbook parsed with ExcelJS, worksheets:', workbook.worksheets.length);
      
      // Step 3: Get the first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheet found in template');
      }
      console.log('📋 Using worksheet:', worksheet.name);
      
      // Step 4: Log template structure
      console.log('📋 Template Structure:');
      console.log('   Total rows:', worksheet.rowCount);
      console.log('   Total columns:', worksheet.columnCount);
      
      // Log first 10 rows with their column structure
      console.log('📊 First 10 rows of template:');
      for (let i = 1; i <= Math.min(10, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const rowData = [];
        for (let j = 1; j <= Math.min(7, worksheet.columnCount); j++) {
          const cell = row.getCell(j);
          rowData.push(`Col ${j}: '${cell.value || ''}'`);
        }
        console.log(`   Row ${i}: [${rowData.join(', ')}]`);
      }
      
      // Check if J column exists (column 10)
      console.log('🔍 Checking J column (column 10):');
      let jColumnExists = false;
      for (let i = 1; i <= worksheet.rowCount; i++) {
        const cell = worksheet.getCell(i, 10); // Column J
        if (cell.value) {
          jColumnExists = true;
          console.log(`   Row ${i}, Col J: '${cell.value}'`);
        }
      }
      
      if (!jColumnExists) {
        console.log('⚠️ J column does not exist in template - will need to create it');
      } else {
        console.log('✅ J column exists in template');
      }
      
      console.log('🎉 Excel template reading completed successfully!');
      
    } catch (error) {
      console.error('❌ Error reading Excel template:', error);
      throw error;
    }
  }
}

export const pdfGenerator = new PDFGenerator();