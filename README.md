# Design

A portfolio that demonstrates:
- a user uploading a file via the web,
- how C++ code, compiled to WebAssembly (Wasm), can process the uploaded file,
- how the user interface can display data in various forms (gauges, tables), and
- how animation can be used to provide feedback to the user and improve the user experience.

# Emscripten

Emscripten is a complete compiler toolchain to Wasm. Visit [the Emscripten downloads page](https://emscripten.org/docs/getting_started/downloads.html) for more information.

# XLNT

XLNT is a Cross-platform user-friendly xlsx library for the C++ programming language. For this demonstration, I install XLNT using Emscripten, which allows us to compile our high-performance C++ code to Wasm (and automatically generate Javascript for our app's functionality):

```bash
cd ~
git clone https://github.com/tfussell/xlnt.git
cd xlnt
git submodule update --init --recursive
```

Find Emscripten's `emsdk_env.sh` file and run the `source` command:

```bash
find ~/ -type f -name emsdk_env.sh
# In this case ~/emsdk/emsdk_env.sh so ...
source ~/emsdk/emsdk_env.sh
```

Create `build` directory in the `xlnt` repository and build:

```bash
cd ~/xlnt
mkdir build && cd build
emcmake cmake .. -DCMAKE_TOOLCHAIN_FILE=/Users/tpmccallum/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_BUILD_TYPE=Release
emmake make
```

# C++ to Wasm

This demonstration is special because it actually uses C++ (a file called `main.cpp`) compiled to Wasm. To compile the C++, we use the following command:

```bash
emcc -std=c++11 main.cpp /Users/tpmccallum/xlnt/build/source/libxlnt.a \
  -I /Users/tpmccallum/xlnt/include \
  -s USE_ZLIB=1 \
  -s EXPORTED_FUNCTIONS='["_processUploadedExcel", "_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -s EXPORT_ES6=1 \
  -s MODULARIZE=1 \
  -s ENVIRONMENT='web' \
  -s NO_DISABLE_EXCEPTION_CATCHING \
  -o data_processor.js
```



Below is another simple demonstration that allows the user to move the needle on the gauges.

## Gauges

![Screenshot 2025-03-18 at 14 57 19](https://github.com/user-attachments/assets/32992fa2-0468-49e7-9528-920d0c99c450)

In this demonstration a user can interact with the web page by using the sliders to move the needles on the gauges. This gauge design demonstrates an interactive user interface in a responsive web page (it uses [Bootstrap](https://getbootstrap.com/) and [Google's visualisation tooling](https://developers.google.com/chart/interactive/docs/gallery/gauge)).