// Utilitários de exportação de dados

/**
 * Exporta dados para CSV
 */
export function exportToCSV(filename: string, rows: any[]): void {
  if (rows.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Obter cabeçalhos das chaves do primeiro objeto
  const headers = Object.keys(rows[0]);
  
  // Criar linhas CSV
  const csvRows = rows.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escapar valores que contenham vírgulas, aspas ou quebras de linha
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  // Combinar cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...csvRows
  ].join('\n');

  // Criar blob e fazer download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Exporta dados para XLSX (formato simplificado como CSV)
 */
export function exportToXLSX(filename: string, rows: any[]): void {
  if (rows.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Para simplificar, vamos gerar um CSV e nomear como .xlsx
  // Em produção, seria ideal usar uma biblioteca como xlsx ou exceljs
  const headers = Object.keys(rows[0]);
  
  const csvRows = rows.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  const csvContent = [
    headers.join(','),
    ...csvRows
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.xlsx`);
}

/**
 * Exporta dados para PDF (tabela simples)
 */
export function exportToPDF(
  filename: string, 
  rows: any[], 
  columns: { key: string; label: string }[]
): void {
  if (rows.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Criar HTML para o PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #4B5563;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
          font-size: 12px;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>${filename}</h1>
      <p>Data de exportação: ${new Date().toLocaleString('pt-PT')}</p>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${columns.map(col => {
                let value = row[col.key];
                if (value === null || value === undefined) value = '';
                // Truncar textos muito longos
                const stringValue = String(value);
                const truncated = stringValue.length > 100 
                  ? stringValue.substring(0, 97) + '...' 
                  : stringValue;
                return `<td>${truncated}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Gerado automaticamente pelo Sistema AEC</p>
      </div>
    </body>
    </html>
  `;

  // Abrir nova janela e imprimir
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
      // Fechar após impressão (opcional)
      // printWindow.close();
    };
  } else {
    alert('Por favor, permita pop-ups para exportar PDF');
  }
}

/**
 * Função auxiliar para fazer download de blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpar URL do blob
  URL.revokeObjectURL(url);
}
