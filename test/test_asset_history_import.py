from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
import sys

from openpyxl import Workbook

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))

from generate_asset_history_import_sql import write_import_sql


class AssetHistoryImportTest(unittest.TestCase):
    def test_generates_idempotent_code_matched_import_without_printing_records(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            source = Path(temp_dir) / 'mock.xlsx'
            output = Path(temp_dir) / 'private-import.sql'
            workbook = Workbook()
            sheet = workbook.active
            sheet.append(['응답일시', '성명(*)', '소속(*)', '노트북1 모델명', '노트북1 자산번호', '노트북1 제조연월'])
            sheet.append(['2025-11-25', '가상 응답자', '가상 부서', '가상 노트북', 'MOCK-001', '2024-01'])
            sheet.append(['2025-11-26', '가상 응답자2', '가상 부서2', '미등록 모델', 'UNKNOWN-001', None])
            workbook.save(source)

            summary = write_import_sql(source, output)
            sql = output.read_text(encoding='utf-8')

            self.assertEqual(summary['response_rows'], 2)
            self.assertEqual(summary['asset_number_cells'], 2)
            self.assertIn('ON CONFLICT(source_sheet_key, source_row, source_column) DO UPDATE', sql)
            self.assertIn('= \'MOCK-001\'', sql)
            self.assertIn('= \'UNKNOWN-001\'', sql)
            self.assertIn('COUNT(*) FROM assets', sql)
            self.assertNotIn('가상 응답자', str(summary))
            self.assertNotIn('가상 부서', str(summary))


if __name__ == '__main__':
    unittest.main()
