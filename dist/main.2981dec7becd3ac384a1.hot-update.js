"use strict";
self["webpackHotUpdatebachelorproef_app_shell"]("main",{

/***/ "./src/layout.tsx":
/*!************************!*\
  !*** ./src/layout.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "errors": () => (/* binding */ errors),
/* harmony export */   "layout": () => (/* binding */ layout)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var piral__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! piral */ "./node_modules/piral-core/esm/components/SwitchErrorInfo.js");
/* harmony import */ var piral__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! piral */ "./node_modules/piral-notifications/esm/Notifications.js");
/* harmony import */ var piral__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! piral */ "./node_modules/piral-menu/esm/Menu.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/esm/react-router-dom.js");
/* harmony import */ var _layout_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./layout.css */ "./src/layout.css");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }




var MenuItem = function MenuItem(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", {
    className: "nav-item"
  }, children);
};
var errors = {
  not_found: function not_found() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
      className: 'notfound'
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("img", {
      src: "https://static.vecteezy.com/system/resources/previews/003/309/116/non_2x/ghost-character-illustration-holding-a-stop-sign-free-vector.jpg"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "De pagina die u wenst te bezoeken is niet beschikbaar. Bent u zeker dat deze pagina bestaat?"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_2__.Link, {
      to: "/",
      className: "center-btn btn btn-default"
    }, "Keer terug naar nomadr-webshop"), "."));
  }
};
var layout = {
  ErrorInfo: function ErrorInfo(props) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
      className: "notfound"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("h1", null, "Oepsie.."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(piral__WEBPACK_IMPORTED_MODULE_3__.SwitchErrorInfo, Object.assign({}, props)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "Er is iets foutgelopen..."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_2__.Link, {
      to: "/",
      className: "center-btn btn btn-default"
    }, "Keer terug naar nomadr-webshop"), "."));
  },
  DashboardContainer: function DashboardContainer(_ref2) {
    var children = _ref2.children;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
      className: "main-container -app-shell"
    }, children);
  },
  Layout: function Layout(_ref3) {
    var children = _ref3.children;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(piral__WEBPACK_IMPORTED_MODULE_4__.Notifications, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(piral__WEBPACK_IMPORTED_MODULE_5__.Menu, {
      type: "general"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
      className: "container"
    }, children));
  },
  MenuContainer: function MenuContainer(_ref4) {
    var children = _ref4.children;
    var _React$useState = react__WEBPACK_IMPORTED_MODULE_0__.useState(true),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      collapsed = _React$useState2[0],
      setCollapsed = _React$useState2[1];
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("header", {
      className: "-app-shell"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("nav", {
      className: "navbar navbar-light navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
      className: "container"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_2__.Link, {
      className: "navbar-brand",
      to: "/"
    }, "Nomadr-webshop"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", {
      "aria-label": "Toggle navigation",
      type: "button",
      onClick: function onClick() {
        return setCollapsed(!collapsed);
      },
      className: "navbar-toggler mr-2"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", {
      className: "navbar-toggler-icon"
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
      className: "collapse navbar-collapse d-sm-inline-flex flex-sm-row-reverse ".concat(collapsed ? '' : 'show'),
      "aria-expanded": !collapsed
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", {
      className: "navbar-nav flex-grow"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_2__.Link, Object.assign({
      to: true
    }, children)))))));
  },
  MenuItem: MenuItem
};

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/layout.css":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/layout.css ***!
  \**************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".notfound {\n  align-items: center;\n  text-align: center;\n}\n\nimg {\n  width: 100%;\n  max-width: 300px;\n}\n\n.btn.center-btn {\n  margin:auto;\n  display:table;\n}\n\n.btn {\n    font-family: \"CircularStd-Bold\", sans-serif;\n    font-weight: normal;\n    background-color: transparent;\n    border: solid 4px #000000;\n    color: #000000;\n    cursor: pointer;\n    display: inline-block;\n    font-size: 16px;\n    padding: 12px 28px;\n    text-decoration: none;\n    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);\n    background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='17' fill='%23000000'%3E %3Cpath fill-rule='evenodd' d='M24.736 10.246v6.351l16.4-8.347-16.4-8.099v6.085H.541v4.01h24.195z'/%3E %3C/svg%3E\");\n    background-position: right 32px center;\n    background-repeat: no-repeat;\n    background-size: 31px 12px;\n    padding-right: 80px;\n}\n\n.btn:hover, .btn:focus {\n    background-color: #000;\n    border-color: #000;\n    color: #ffffff;\n    transition: transform 1s cubic-bezier(0.165, 0.84, 0.44, 1), background-color 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 2s cubic-bezier(0.165, 0.84, 0.44, 1);\n    transform: translateY(-4px);\n    box-shadow: 4px 4px 0px rgba(3,4,3,.2);\n    background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='17' fill='%23ffffff'%3E %3Cpath fill-rule='evenodd' d='M24.736 10.246v6.351l16.4-8.347-16.4-8.099v6.085H.541v4.01h24.195z'/%3E %3C/svg%3E\");\n}\n\n.btn:active {\n  transform: translateY(0px);\n  box-shadow: 0px 0px 0px rgba(3,4,3,.15);\n}\n\n\n.btn:hover::after {\n    opacity: 1;\n}\n", "",{"version":3,"sources":["webpack://./src/layout.css"],"names":[],"mappings":"AAAA;EACE,mBAAmB;EACnB,kBAAkB;AACpB;;AAEA;EACE,WAAW;EACX,gBAAgB;AAClB;;AAEA;EACE,WAAW;EACX,aAAa;AACf;;AAEA;IACI,2CAA2C;IAC3C,mBAAmB;IACnB,6BAA6B;IAC7B,yBAAyB;IACzB,cAAc;IACd,eAAe;IACf,qBAAqB;IACrB,eAAe;IACf,kBAAkB;IAClB,qBAAqB;IACrB,uDAAuD;IACvD,gQAAgQ;IAChQ,sCAAsC;IACtC,4BAA4B;IAC5B,0BAA0B;IAC1B,mBAAmB;AACvB;;AAEA;IACI,sBAAsB;IACtB,kBAAkB;IAClB,cAAc;IACd,uKAAuK;IACvK,2BAA2B;IAC3B,sCAAsC;IACtC,gQAAgQ;AACpQ;;AAEA;EACE,0BAA0B;EAC1B,uCAAuC;AACzC;;;AAGA;IACI,UAAU;AACd","sourcesContent":[".notfound {\n  align-items: center;\n  text-align: center;\n}\n\nimg {\n  width: 100%;\n  max-width: 300px;\n}\n\n.btn.center-btn {\n  margin:auto;\n  display:table;\n}\n\n.btn {\n    font-family: \"CircularStd-Bold\", sans-serif;\n    font-weight: normal;\n    background-color: transparent;\n    border: solid 4px #000000;\n    color: #000000;\n    cursor: pointer;\n    display: inline-block;\n    font-size: 16px;\n    padding: 12px 28px;\n    text-decoration: none;\n    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);\n    background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='17' fill='%23000000'%3E %3Cpath fill-rule='evenodd' d='M24.736 10.246v6.351l16.4-8.347-16.4-8.099v6.085H.541v4.01h24.195z'/%3E %3C/svg%3E\");\n    background-position: right 32px center;\n    background-repeat: no-repeat;\n    background-size: 31px 12px;\n    padding-right: 80px;\n}\n\n.btn:hover, .btn:focus {\n    background-color: #000;\n    border-color: #000;\n    color: #ffffff;\n    transition: transform 1s cubic-bezier(0.165, 0.84, 0.44, 1), background-color 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 2s cubic-bezier(0.165, 0.84, 0.44, 1);\n    transform: translateY(-4px);\n    box-shadow: 4px 4px 0px rgba(3,4,3,.2);\n    background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='17' fill='%23ffffff'%3E %3Cpath fill-rule='evenodd' d='M24.736 10.246v6.351l16.4-8.347-16.4-8.099v6.085H.541v4.01h24.195z'/%3E %3C/svg%3E\");\n}\n\n.btn:active {\n  transform: translateY(0px);\n  box-shadow: 0px 0px 0px rgba(3,4,3,.15);\n}\n\n\n.btn:hover::after {\n    opacity: 1;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/layout.css":
/*!************************!*\
  !*** ./src/layout.css ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./layout.css */ "./node_modules/css-loader/dist/cjs.js!./src/layout.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);


if (true) {
  if (!_node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || module.hot.invalidate) {
    var isEqualLocals = function isEqualLocals(a, b, isNamedExport) {
  if (!a && b || a && !b) {
    return false;
  }

  var p;

  for (p in a) {
    if (isNamedExport && p === 'default') {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (a[p] !== b[p]) {
      return false;
    }
  }

  for (p in b) {
    if (isNamedExport && p === 'default') {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!a[p]) {
      return false;
    }
  }

  return true;
};
    var oldLocals = _node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals;

    module.hot.accept(
      /*! !!../node_modules/css-loader/dist/cjs.js!./layout.css */ "./node_modules/css-loader/dist/cjs.js!./src/layout.css",
      __WEBPACK_OUTDATED_DEPENDENCIES__ => { /* harmony import */ _node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./layout.css */ "./node_modules/css-loader/dist/cjs.js!./src/layout.css");
(function () {
        if (!isEqualLocals(oldLocals, _node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals, undefined)) {
                module.hot.invalidate();

                return;
              }

              oldLocals = _node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals;

              update(_node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__["default"]);
      })(__WEBPACK_OUTDATED_DEPENDENCIES__); }
    )
  }

  module.hot.dispose(function() {
    update();
  });
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("c23110147f4a2e1ec834")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.2981dec7becd3ac384a1.hot-update.js.map