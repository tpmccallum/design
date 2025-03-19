# Design - Demonstration 1

A C++ and WebAssembly (Wasm) application that demonstrates:
- a user uploading a file via the web,
- how C++ code, compiled to Wasm, can process the uploaded file,
- how the user interface can display data in various forms (gauges, tables), and
- how animation can be used to provide feedback to the user and improve the user experience.

It is ready to use. You can [click here to try it out](https://tpmccallum.github.io/design/webassembly/).

(This demonstration allows you to upload files. Here is [a Microsoft Excel file](https://github.com/tpmccallum/design/raw/refs/heads/main/webassembly/data.xlsx) and [a JSON file](https://raw.githubusercontent.com/tpmccallum/design/refs/heads/main/webassembly/data.json) that I prepared for your convenience.)

# Under The Hood

This section explains a little about what is under the hood, on this demonstration.

## Emscripten

This demonstration harnesses Emscripten. Emscripten is a complete compiler toolchain to Wasm. Visit [the Emscripten downloads page](https://emscripten.org/docs/getting_started/downloads.html) for more information.

## XLNT

This demonstration also harnesses XLNT. XLNT is a cross-platform user-friendly `.xlsx` library for the C++ programming language. For this demonstration, I install XLNT using Emscripten, which allows us to compile our high-performance C++ code to `.wasm` (and automatically generate Javascript for our app's functionality):

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

## C++ to Wasm

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

![Screenshot 2025-03-19 at 16 14 25](https://github.com/user-attachments/assets/707e813e-68d8-4c8c-9d3a-216974430a3e)

# Try It

I have already done all of the hard work. You just need to [click here to try it out](https://tpmccallum.github.io/design/webassembly/).

**NOTE:** (This demonstration allows you to upload files. Here is [a Microsoft Excel file](https://github.com/tpmccallum/design/raw/refs/heads/main/webassembly/data.xlsx) and [a JSON file](https://raw.githubusercontent.com/tpmccallum/design/refs/heads/main/webassembly/data.json) that I prepared for your convenience.)

If you would like to see more, below is another simple demonstration that allows the user to move the needle on some gauges in real time.

---

# Design - Demonstration 2

A lean `.html`, `.js` and `.css` example application that demonstrates:
- how a user can interact with a web page,
- how the user can move the needle in real time,
- how visual components can be automated to provide feedback to the user, and
- how a properly designed page can render perfectly on different screen sizes (and different hand-held and mobile devices).

You can [click here to try it out](https://tpmccallum.github.io/design/gauges/).

## Gauges

In this demonstration a user can interact with the web page by using the sliders to move the needles on the gauges. 

![Screenshot 2025-03-18 at 14 57 19](https://github.com/user-attachments/assets/32992fa2-0468-49e7-9528-920d0c99c450)

This gauge design demonstrates an interactive user interface in a responsive web page (it uses [Bootstrap](https://getbootstrap.com/) and [Google's visualisation tooling](https://developers.google.com/chart/interactive/docs/gallery/gauge)).
