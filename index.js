// 打印类属性、方法定义
/* eslint-disable */
const Print = function (dom, echartPics, options) {
  // debugger;
  if (!(this instanceof Print)) return new Print(dom, echartPics, options);

  this.options = this.extend(
    {
      noPrint: ".no-print",
      chartContainerClass: "chart-container",
      isDebug: false,
    },
    options
  );

  if (typeof dom === "string") {
    this.dom = document.querySelector(dom);
  } else {
    this.isDOM(dom);
    this.dom = this.isDOM(dom) ? dom : dom.$el;
  }

  this.init(echartPics);
};
Print.prototype = {
  init: function (echartPics) {
    var content = this.getStyle() + this.getHtml();
    this.writeIframe(content, echartPics);
  },
  extend: function (obj, obj2) {
    for (var k in obj2) {
      obj[k] = obj2[k];
    }
    return obj;
  },

  getStyle: function () {
    var str = "",
      styles = document.querySelectorAll("style,link");
    for (var i = 0; i < styles.length; i++) {
      str += styles[i].outerHTML;
    }
    str +=
      "<style>" +
      (this.options.noPrint ? this.options.noPrint : ".no-print") +
      "{display:none;}</style>";
    str +=
      "<style>html,body,div{height: auto!important;font-size:14px}</style>";
    str +=
      "<style>@media print {body * {height: auto!important;overflow: visible!important;}}</style>";

    return str;
  },

  getHtml: function () {
    var inputs = document.querySelectorAll("input");
    var textareas = document.querySelectorAll("textarea");
    var selects = document.querySelectorAll("select");

    for (var k = 0; k < inputs.length; k++) {
      if (inputs[k].type == "checkbox" || inputs[k].type == "radio") {
        if (inputs[k].checked == true) {
          inputs[k].setAttribute("checked", "checked");
        } else {
          inputs[k].removeAttribute("checked");
        }
      } else if (inputs[k].type == "text") {
        inputs[k].setAttribute("value", inputs[k].value);
      } else {
        inputs[k].setAttribute("value", inputs[k].value);
      }
    }

    for (var k2 = 0; k2 < textareas.length; k2++) {
      if (textareas[k2].type == "textarea") {
        textareas[k2].innerHTML = textareas[k2].value;
      }
    }

    for (var k3 = 0; k3 < selects.length; k3++) {
      if (selects[k3].type == "select-one") {
        var child = selects[k3].children;
        for (var i in child) {
          if (child[i].tagName == "OPTION") {
            if (child[i].selected == true) {
              child[i].setAttribute("selected", "selected");
            } else {
              child[i].removeAttribute("selected");
            }
          }
        }
      }
    }
    // 包裹要打印的元素
    // fix: https://github.com/xyl66/vuePlugs_printjs/issues/36
    let outerHTML = this.wrapperRefDom(this.dom).outerHTML;
    return outerHTML;
  },
  // 向父级元素循环，包裹当前需要打印的元素
  // 防止根级别开头的 css 选择器不生效
  wrapperRefDom: function (refDom) {
    let prevDom = null;
    let currDom = refDom;
    // 判断当前元素是否在 body 中，不在文档中则直接返回该节点
    if (!this.isInBody(currDom)) return currDom;

    while (currDom) {
      if (prevDom) {
        let element = currDom.cloneNode(false);
        element.appendChild(prevDom);
        prevDom = element;
      } else {
        prevDom = currDom.cloneNode(true);
      }

      currDom = currDom.parentElement;
    }

    return prevDom;
  },

  writeIframe: function (content, echartPics) {
    var w,
      doc,
      iframe = document.createElement("iframe"),
      f = document.body.appendChild(iframe);
    iframe.id = "myIframe";
    //iframe.style = "position:absolute;width:0;height:0;top:-10px;left:-10px;";
    if(this.options.isDebug){
      iframe.setAttribute(
        "style",
        "position:absolute;width:1000px;height:800px;top:100px;left:100px;overflow:auto;"
      );
    }else{
      iframe.setAttribute(
        "style",
        "position:absolute;width:0;height:0;top:-10px;left:-10px;"
      );
    }
    w = f.contentWindow || f.contentDocument;
    doc = f.contentDocument || f.contentWindow.document;
    doc.open();
    doc.write(content);
    const chartHolders = doc.getElementsByClassName(
      this.options.chartContainerClass
    );
    Array.from(chartHolders).forEach((holder, index) => {
      holder.innerHTML += `<img src="${echartPics[index].data}" style="width: ${echartPics[index].width}; height: ${echartPics[index].height};" />`;
    });
    doc.close();
    // debugger;
    var _this = this;
    iframe.onload = function () {
      // debugger;
      _this.toPrint(w);
      setTimeout(function () {
        debugger;
        if (!_this.options.isDebug) {
          document.body.removeChild(iframe);
        }
      }, 100);
    };
  },

  toPrint: function (frameWindow) {
    try {
      setTimeout(function () {
        frameWindow.focus();
        try {
          if (!frameWindow.document.execCommand("print", false, null)) {
            frameWindow.print();
          }
        } catch (e) {
          frameWindow.print();
        }
        frameWindow.close();
      }, 10);
    } catch (err) {
      console.log("err", err);
    }
  },
  // 检查一个元素是否是 body 元素的后代元素且非 body 元素本身
  isInBody: function (node) {
    return node === document.body ? false : document.body.contains(node);
  },
  isDOM:
    typeof HTMLElement === "object"
      ? function (obj) {
          return obj instanceof HTMLElement;
        }
      : function (obj) {
          return (
            obj &&
            typeof obj === "object" &&
            obj.nodeType === 1 &&
            typeof obj.nodeName === "string"
          );
        },
};
const PrintPlugin = {};
PrintPlugin.install = function (Vue, options) {
  // 4. 添加实例方法
  Vue.prototype.$print = Print;
};
export default PrintPlugin;
