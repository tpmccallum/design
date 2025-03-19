#include <emscripten.h>
#include <xlnt/xlnt.hpp>
#include "nlohmann/json.hpp"
#include <string>
#include <vector>

using json = nlohmann::json;

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    const char* processUploadedExcel(const unsigned char* file_data, int file_size) {
        // Here, I create a vector from the raw binary data
        std::vector<unsigned char> excel_data(file_data, file_data + file_size);

        // I then load the Excel file as a workbook
        xlnt::workbook wb;
        try {
            wb.load(excel_data);
        } catch (const std::exception& e) {
            std::string error = "Error loading Excel: " + std::string(e.what());
            char* result = new char[error.size() + 1];
            std::strcpy(result, error.c_str());
            return result;
        }

        // Then, I process the Excel file and convert it to a JSON array
        xlnt::worksheet ws = wb.active_sheet();
        json json_array = json::array();
        int row_count = ws.highest_row();
        const int max_cols = 10;

        for (int row_idx = 1; row_idx <= row_count; ++row_idx) {
            json row_obj = json::object();
            for (int col_idx = 0; col_idx < max_cols; ++col_idx) {
                std::string col_letter = xlnt::column_t::column_string_from_index(col_idx + 1);
                std::string cell_ref = col_letter + std::to_string(row_idx);
                if (ws.has_cell(cell_ref)) {
                    std::string key = "Column_" + col_letter;
                    row_obj[key] = ws.cell(cell_ref).to_string();
                }
            }
            if (!row_obj.empty()) {
                json_array.push_back(row_obj);
            }
        }
        
        // Finally, I convert the JSON array to a string and return it
        std::string json_str = json_array.dump(2);
        char* result = new char[json_str.size() + 1];
        std::strcpy(result, json_str.c_str());
        return result;
    }
}

int main() {
    return 0;
}