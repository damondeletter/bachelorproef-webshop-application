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
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", {
      className: "error"
    }, "De pagina die u wenst te bezoeken is niet beschikbaar. Bent u zeker dat deze pagina bestaat?"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "Keer terug ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_2__.Link, {
      to: "/"
    }, "naar nomadr-webshop"), "."));
  }
};
var layout = {
  ErrorInfo: function ErrorInfo(props) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("h1", null, "Oepsie.."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(piral__WEBPACK_IMPORTED_MODULE_3__.SwitchErrorInfo, Object.assign({}, props)));
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
    }, children)))));
  },
  MenuItem: MenuItem
};

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("d293a811b2186b5b8895")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.d223762c7c3705a4dc01.hot-update.js.map