"use strict";
self["webpackHotUpdatebachelorproef_app_shell"]("main",{

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ "./node_modules/react-dom/client.js");
/* harmony import */ var piral__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! piral */ "./node_modules/piral-core/esm/createInstance.js");
/* harmony import */ var piral__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! piral */ "./node_modules/piral-ext/esm/create.js");
/* harmony import */ var piral__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! piral */ "./node_modules/piral-core/esm/Piral.js");
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./layout */ "./src/layout.tsx");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }




// change to your feed URL here (either using feed.piral.cloud or your own service)
var feedUrl = 'https://feed.piral.cloud/api/v1/pilet/damondeletter-webshop';
var instance = (0,piral__WEBPACK_IMPORTED_MODULE_3__.createInstance)({
  state: {
    components: _layout__WEBPACK_IMPORTED_MODULE_2__.layout,
    errorComponents: _layout__WEBPACK_IMPORTED_MODULE_2__.errors
  },
  plugins: _toConsumableArray((0,piral__WEBPACK_IMPORTED_MODULE_4__.createStandardApi)()),
  requestPilets: function requestPilets() {
    return fetch(feedUrl).then(function (res) {
      return res.json();
    }).then(function (res) {
      return res.items;
    });
  }
});
var root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(document.querySelector('#app'));
root.render( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(piral__WEBPACK_IMPORTED_MODULE_5__.Piral, {
  instance: instance
}));

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("519ab8ede59af2ac3f7e")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.398c75c82441e2bdeda1.hot-update.js.map