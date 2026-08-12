import { ref as _, openBlock as n, createElementBlock as l, normalizeClass as w, renderSlot as N, computed as x, createBlock as L, unref as ht, createElementVNode as u, createCommentVNode as f, toDisplayString as k, watch as J, withModifiers as ee, createVNode as F, Transition as te, withCtx as Y, Fragment as O, renderList as j, onMounted as re, onUnmounted as ce, normalizeStyle as D, withKeys as ye, createTextVNode as oe, nextTick as ve, Teleport as fe, useSlots as yt, withDirectives as Ce, vShow as Fe, resolveDynamicComponent as bt, mergeProps as gt, resolveComponent as Ae, inject as Ue, onBeforeUnmount as Ee, provide as ze, TransitionGroup as kt } from "vue";
import { Icon as $t } from "@iconify/vue";
import { useRoute as Ye, useRouter as wt } from "vue-router";
const B = (e, s) => {
  const t = e.__vccOpts || e;
  for (const [a, o] of s)
    t[a] = o;
  return t;
}, _t = {
  __name: "FluentAnimatedIcon",
  props: {
    animation: { type: String, default: "bounce" },
    duration: { type: Number, default: 300 },
    trigger: { type: String, default: "hover" }
    // hover, click, auto
  },
  emits: ["animation-start", "animation-end"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1);
    let i = null;
    const r = () => {
      o.value = !0, a("animation-start"), i && clearTimeout(i), i = setTimeout(() => {
        o.value = !1, a("animation-end");
      }, t.duration);
    }, c = () => {
      t.trigger === "hover" && r();
    }, d = () => {
    }, m = () => {
      t.trigger === "click" && r();
    };
    if (t.trigger === "auto") {
      const b = setInterval(() => {
        r();
      }, t.duration * 3);
      onUnmounted(() => {
        clearInterval(b);
      });
    }
    return (b, h) => (n(), l("div", {
      class: w(["fluent-animated-icon", { "is-animating": o.value }]),
      onMouseenter: c,
      onMouseleave: d,
      onClick: m
    }, [
      N(b.$slots, "default", {}, void 0, !0)
    ], 34));
  }
}, St = /* @__PURE__ */ B(_t, [["__scopeId", "data-v-2e565f97"]]), xt = {
  __name: "FluentIcon",
  props: {
    icon: { type: String, required: !0 },
    width: { type: [Number, String], default: 20 },
    height: { type: [Number, String], default: void 0 },
    className: { type: String, default: "" }
  },
  setup(e) {
    const s = e, t = {
      home: "home-20-regular",
      settings: "settings-20-regular",
      search: "search-20-regular",
      add: "add-20-regular",
      delete: "delete-20-regular",
      edit: "edit-20-regular",
      heart: "heart-20-regular",
      star: "star-20-regular",
      share: "share-20-regular",
      download: "arrow-download-20-regular",
      upload: "arrow-upload-20-regular",
      copy: "copy-20-regular",
      check: "checkmark-20-regular",
      close: "dismiss-20-regular",
      "arrow-left": "arrow-left-20-regular",
      "arrow-right": "arrow-right-20-regular",
      "chevron-down": "chevron-down-20-regular",
      "chevron-up": "chevron-up-20-regular",
      "more-horizontal": "more-horizontal-20-regular",
      "more-vertical": "more-vertical-20-regular",
      options: "options-20-regular",
      "auto-suggest": "search-20-regular",
      button: "cursor-click-20-regular",
      checkbox: "checkbox-checked-20-regular",
      "color-picker": "eyedropper-20-regular",
      calendar: "calendar-20-regular",
      "dropdown-button": "chevron-down-20-regular",
      hyperlink: "link-20-regular",
      "text-field": "textbox-20-regular",
      "list-box": "list-20-regular",
      number: "number-symbol-20-regular",
      password: "password-20-regular",
      "radio-button": "radio-button-20-regular",
      "repeat-button": "arrow-repeat-all-20-regular",
      list: "list-20-regular",
      slider: "slide-size-20-regular",
      "split-button": "split-horizontal-20-regular",
      text: "document-text-20-regular",
      clock: "clock-20-regular",
      "toggle-left": "toggle-left-20-regular",
      layout: "layout-column-two-20-regular",
      card: "card-ui-20-regular",
      expander: "chevron-down-20-regular",
      tabs: "tab-20-regular",
      feedback: "chat-20-regular",
      flyout: "window-new-20-regular",
      "info-bar": "info-20-regular",
      modal: "window-20-regular",
      "progress-bar": "arrow-clockwise-20-regular",
      "progress-ring": "arrow-clockwise-20-regular",
      "teaching-tip": "lightbulb-20-regular",
      toast: "alert-20-regular",
      tooltip: "chat-help-20-regular",
      navigation: "navigation-20-regular",
      "navigation-view": "navigation-20-regular",
      breadcrumb: "text-bullet-list-ltr-20-regular",
      "command-bar": "key-command-20-regular",
      "menu-bar": "line-horizontal-3-20-regular",
      pivot: "arrow-swap-20-regular",
      "selector-bar": "options-20-regular",
      sidebar: "panel-left-20-regular",
      "tree-view": "text-bullet-list-tree-20-regular",
      collections: "apps-list-20-regular",
      "flip-view": "arrow-swap-20-regular",
      "grid-view": "grid-20-regular",
      "list-view": "list-20-regular",
      "media-player": "video-20-regular",
      scrolling: "phone-vertical-scroll-20-regular",
      "pips-pager": "more-horizontal-20-regular",
      "scroll-viewer": "phone-vertical-scroll-20-regular",
      "semantic-zoom": "zoom-in-20-regular",
      more: "more-horizontal-20-regular",
      icon: "symbols-20-regular",
      fullscreen: "full-screen-maximize-20-regular",
      person: "person-20-regular",
      rating: "star-20-regular",
      splash: "weather-sunny-20-regular",
      palette: "paint-brush-20-regular",
      color: "color-20-regular",
      material: "layer-20-regular",
      animation: "sparkle-20-regular",
      transition: "arrow-swap-20-regular",
      gesture: "hand-wave-20-regular"
    }, a = x(() => s.icon.includes(":") ? s.icon : `fluent:${t[s.icon] || s.icon}`);
    return (o, i) => (n(), L(ht($t), {
      icon: a.value,
      width: e.width,
      height: e.height,
      class: w(["fluent-icon", e.className])
    }, null, 8, ["icon", "width", "height", "class"]));
  }
}, C = /* @__PURE__ */ B(xt, [["__scopeId", "data-v-879a911a"]]), Ct = ["disabled"], Ft = { class: "app-bar-button-icon" }, Vt = {
  key: 0,
  class: "app-bar-button-label"
}, It = {
  __name: "FluentAppBarButton",
  props: {
    icon: { type: String, default: "" },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    compact: { type: Boolean, default: !1 }
  },
  emits: ["click"],
  setup(e) {
    return (s, t) => (n(), l("button", {
      class: w(["fluent-app-bar-button", { "is-disabled": e.disabled, "is-compact": e.compact }]),
      disabled: e.disabled,
      onClick: t[0] || (t[0] = (a) => s.$emit("click", a))
    }, [
      u("span", Ft, [
        N(s.$slots, "icon", {}, () => [
          e.icon ? (n(), L(C, {
            key: 0,
            icon: e.icon,
            width: 20
          }, null, 8, ["icon"])) : f("", !0)
        ], !0)
      ]),
      !e.compact && e.label ? (n(), l("span", Vt, k(e.label), 1)) : f("", !0)
    ], 10, Ct));
  }
}, Bt = /* @__PURE__ */ B(It, [["__scopeId", "data-v-70f8257e"]]), Mt = {
  __name: "FluentAppBarSeparator",
  props: {
    compact: { type: Boolean, default: !1 }
  },
  setup(e) {
    return (s, t) => (n(), l("div", {
      class: w(["fluent-app-bar-separator", { "is-compact": e.compact }])
    }, null, 2));
  }
}, Tt = /* @__PURE__ */ B(Mt, [["__scopeId", "data-v-3b16adfe"]]), Pt = ["disabled"], Rt = { class: "app-bar-button-icon" }, Nt = {
  key: 0,
  class: "app-bar-button-label"
}, zt = {
  __name: "FluentAppBarToggleButton",
  props: {
    icon: { type: String, default: "" },
    label: { type: String, default: "" },
    modelValue: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 },
    compact: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x(() => t.modelValue), i = () => {
      if (t.disabled) return;
      const r = !t.modelValue;
      a("update:modelValue", r), a("change", r);
    };
    return (r, c) => (n(), l("button", {
      class: w(["fluent-app-bar-toggle-button", {
        "is-disabled": e.disabled,
        "is-compact": e.compact,
        "is-checked": o.value
      }]),
      disabled: e.disabled,
      onClick: i
    }, [
      u("span", Rt, [
        N(r.$slots, "icon", {}, () => [
          e.icon ? (n(), L(C, {
            key: 0,
            icon: e.icon,
            width: 20
          }, null, 8, ["icon"])) : f("", !0)
        ], !0)
      ]),
      !e.compact && e.label ? (n(), l("span", Nt, k(e.label), 1)) : f("", !0)
    ], 10, Pt));
  }
}, At = /* @__PURE__ */ B(zt, [["__scopeId", "data-v-fa5d8481"]]), Et = {
  key: 0,
  class: "auto-suggest-label"
}, Lt = { class: "auto-suggest-container" }, Dt = { class: "auto-suggest-input-wrapper" }, Ot = ["value", "placeholder", "disabled"], Kt = {
  key: 0,
  class: "auto-suggest-dropdown"
}, qt = ["onClick", "onMouseenter"], Ht = { class: "auto-suggest-item-text" }, jt = {
  key: 1,
  class: "auto-suggest-error"
}, Wt = {
  key: 2,
  class: "auto-suggest-description"
}, Gt = {
  __name: "FluentAutoSuggestBox",
  props: {
    modelValue: { type: String, default: "" },
    suggestions: { type: Array, default: () => [] },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    icon: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    clearable: { type: Boolean, default: !0 },
    valueKey: { type: String, default: "" },
    filterMethod: { type: Function, default: null },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change", "select", "search", "focus", "blur"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(!1), r = _(-1), c = x(() => {
      if (!t.modelValue) return t.suggestions;
      if (t.filterMethod)
        return t.filterMethod(t.modelValue, t.suggestions);
      const p = t.modelValue.toLowerCase();
      return t.suggestions.filter(($) => d($).toLowerCase().includes(p));
    }), d = (p) => typeof p == "string" || typeof p == "number" ? String(p) : t.valueKey && p[t.valueKey] ? String(p[t.valueKey]) : String(p), m = (p) => {
      const $ = p.target.value;
      a("update:modelValue", $), a("change", $), a("search", $), r.value = -1;
    }, b = (p) => {
      i.value = !0, a("focus", p);
    }, h = (p) => {
      setTimeout(() => {
        i.value = !1, r.value = -1;
      }, 200), a("blur", p);
    }, g = (p) => {
      if (i.value)
        switch (p.key) {
          case "ArrowDown":
            p.preventDefault(), r.value = Math.min(r.value + 1, c.value.length - 1);
            break;
          case "ArrowUp":
            p.preventDefault(), r.value = Math.max(r.value - 1, -1);
            break;
          case "Enter":
            p.preventDefault(), r.value >= 0 && y(c.value[r.value]);
            break;
          case "Escape":
            i.value = !1, r.value = -1;
            break;
        }
    }, y = (p) => {
      const $ = d(p);
      a("update:modelValue", $), a("change", $), a("select", p), i.value = !1, r.value = -1;
    }, v = () => {
      var p;
      a("update:modelValue", ""), a("change", ""), (p = o.value) == null || p.focus();
    };
    return J(() => t.modelValue, () => {
      r.value = -1;
    }), (p, $) => (n(), l("div", {
      class: w(["fluent-auto-suggest-box", { "is-open": i.value }])
    }, [
      e.label ? (n(), l("div", Et, k(e.label), 1)) : f("", !0),
      u("div", Lt, [
        u("div", Dt, [
          e.icon ? (n(), L(C, {
            key: 0,
            icon: e.icon,
            width: 16,
            class: "auto-suggest-icon"
          }, null, 8, ["icon"])) : f("", !0),
          u("input", {
            ref_key: "inputRef",
            ref: o,
            type: "text",
            class: "auto-suggest-input",
            value: e.modelValue,
            placeholder: e.placeholder,
            disabled: e.disabled,
            onInput: m,
            onFocus: b,
            onBlur: h,
            onKeydown: g
          }, null, 40, Ot),
          e.modelValue && e.clearable ? (n(), l("button", {
            key: 1,
            class: "auto-suggest-clear",
            type: "button",
            onMousedown: $[0] || ($[0] = ee(() => {
            }, ["prevent"])),
            onClick: v
          }, [
            F(C, {
              icon: "dismiss-16-regular",
              width: 12
            })
          ], 32)) : f("", !0)
        ]),
        F(te, { name: "dropdown" }, {
          default: Y(() => [
            i.value && c.value.length > 0 ? (n(), l("div", Kt, [
              (n(!0), l(O, null, j(c.value, (I, S) => (n(), l("div", {
                key: S,
                class: w(["auto-suggest-item", { "is-highlighted": r.value === S }]),
                onMousedown: $[1] || ($[1] = ee(() => {
                }, ["prevent"])),
                onClick: (M) => y(I),
                onMouseenter: (M) => r.value = S
              }, [
                N(p.$slots, "suggestion", { suggestion: I }, () => [
                  u("span", Ht, k(d(I)), 1)
                ], !0)
              ], 42, qt))), 128))
            ])) : f("", !0)
          ]),
          _: 3
        })
      ]),
      e.error ? (n(), l("div", jt, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", Wt, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, Ut = /* @__PURE__ */ B(Gt, [["__scopeId", "data-v-bbf28b50"]]), Yt = {
  __name: "FluentBackToTop",
  props: {
    target: { type: String, default: "" },
    visibilityHeight: { type: Number, default: 300 },
    right: { type: Number, default: 40 },
    bottom: { type: Number, default: 40 }
  },
  setup(e) {
    const s = e, t = _(!1), a = x(() => ({
      right: `${s.right}px`,
      bottom: `${s.bottom}px`
    })), o = () => {
      if (s.target) {
        const r = document.querySelector(s.target);
        r && (t.value = r.scrollTop > s.visibilityHeight);
      } else
        t.value = window.scrollY > s.visibilityHeight;
    }, i = () => {
      if (s.target) {
        const r = document.querySelector(s.target);
        r && r.scrollTo({ top: 0, behavior: "smooth" });
      } else
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return re(() => {
      if (s.target) {
        const r = document.querySelector(s.target);
        r && r.addEventListener("scroll", o);
      } else
        window.addEventListener("scroll", o);
    }), ce(() => {
      if (s.target) {
        const r = document.querySelector(s.target);
        r && r.removeEventListener("scroll", o);
      } else
        window.removeEventListener("scroll", o);
    }), (r, c) => (n(), L(te, { name: "fade" }, {
      default: Y(() => [
        t.value ? (n(), l("button", {
          key: 0,
          class: "fluent-back-to-top",
          style: D(a.value),
          onClick: i,
          "aria-label": "回到顶部"
        }, [
          F(C, {
            icon: "arrow-up-20-regular",
            width: 20
          })
        ], 4)) : f("", !0)
      ]),
      _: 1
    }));
  }
}, Xt = /* @__PURE__ */ B(Yt, [["__scopeId", "data-v-f92daa92"]]), Zt = { class: "breadcrumb-items" }, Qt = ["href", "onClick"], Jt = { class: "breadcrumb-text" }, en = {
  key: 1,
  class: "breadcrumb-current"
}, tn = { class: "breadcrumb-text" }, nn = {
  key: 2,
  class: "breadcrumb-separator",
  "aria-hidden": "true"
}, ln = {
  __name: "FluentBreadcrumbBar",
  props: {
    items: { type: Array, required: !0 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["item-click"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = (i, r) => {
      t.disabled || i.disabled || a("item-click", { item: i, index: r });
    };
    return (i, r) => (n(), l("nav", {
      class: w(["fluent-breadcrumb-bar", { "is-disabled": e.disabled }])
    }, [
      u("ol", Zt, [
        (n(!0), l(O, null, j(e.items, (c, d) => (n(), l("li", {
          key: d,
          class: w(["breadcrumb-item", { "is-current": d === e.items.length - 1, "is-disabled": c.disabled }])
        }, [
          d < e.items.length - 1 && !c.disabled ? (n(), l("a", {
            key: 0,
            class: "breadcrumb-link",
            href: c.href || "#",
            onClick: ee((m) => o(c, d), ["prevent"])
          }, [
            c.icon ? (n(), L(C, {
              key: 0,
              icon: c.icon,
              width: 14
            }, null, 8, ["icon"])) : f("", !0),
            u("span", Jt, k(c.label), 1)
          ], 8, Qt)) : (n(), l("span", en, [
            c.icon ? (n(), L(C, {
              key: 0,
              icon: c.icon,
              width: 14
            }, null, 8, ["icon"])) : f("", !0),
            u("span", tn, k(c.label), 1)
          ])),
          d < e.items.length - 1 ? (n(), l("span", nn, [
            F(C, {
              icon: "chevron-right-20-regular",
              width: 12
            })
          ])) : f("", !0)
        ], 2))), 128))
      ])
    ], 2));
  }
}, an = /* @__PURE__ */ B(ln, [["__scopeId", "data-v-2fcfc6b5"]]), on = ["disabled"], sn = {
  __name: "FluentButton",
  props: {
    variant: {
      type: String,
      default: "primary",
      validator: (e) => ["primary", "secondary", "subtle", "danger"].includes(e)
    },
    size: {
      type: String,
      default: "md",
      validator: (e) => ["sm", "md", "lg"].includes(e)
    },
    iconOnly: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["click"],
  setup(e) {
    return (s, t) => (n(), l("button", {
      class: w(["fluent-btn", e.variant, e.size, { "icon-only": e.iconOnly, disabled: e.disabled }]),
      disabled: e.disabled,
      onClick: t[0] || (t[0] = (a) => s.$emit("click", a))
    }, [
      N(s.$slots, "default", {}, void 0, !0)
    ], 10, on));
  }
}, be = /* @__PURE__ */ B(sn, [["__scopeId", "data-v-d77794b2"]]), rn = {
  key: 0,
  class: "calendar-date-picker-label"
}, un = { class: "calendar-date-picker-container" }, cn = {
  key: 0,
  class: "calendar-dropdown"
}, dn = { class: "calendar-header" }, fn = { class: "header-title" }, mn = { class: "calendar-weekdays" }, vn = { class: "calendar-days" }, pn = ["disabled", "onClick"], hn = {
  key: 1,
  class: "calendar-date-picker-error"
}, yn = {
  key: 2,
  class: "calendar-date-picker-description"
}, bn = {
  __name: "FluentCalendarDatePicker",
  props: {
    modelValue: { type: String, default: "" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "选择日期" },
    disabled: { type: Boolean, default: !1 },
    min: { type: String, default: "" },
    max: { type: String, default: "" },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1), i = _(/* @__PURE__ */ new Date()), r = ["日", "一", "二", "三", "四", "五", "六"], c = x(() => {
      const I = i.value.getFullYear(), S = i.value.getMonth() + 1;
      return `${I}年${S}月`;
    }), d = x(() => {
      if (!t.modelValue) return "";
      const I = new Date(t.modelValue);
      return `${I.getFullYear()}-${String(I.getMonth() + 1).padStart(2, "0")}-${String(I.getDate()).padStart(2, "0")}`;
    }), m = x(() => {
      const I = i.value.getFullYear(), S = i.value.getMonth(), M = /* @__PURE__ */ new Date(), P = `${M.getFullYear()}-${String(M.getMonth() + 1).padStart(2, "0")}-${String(M.getDate()).padStart(2, "0")}`, R = new Date(I, S, 1), z = new Date(I, S + 1, 0), K = [], E = R.getDay();
      for (let G = E - 1; G >= 0; G--) {
        const H = new Date(I, S, -G), X = b(H);
        K.push({
          date: X,
          day: H.getDate(),
          isCurrentMonth: !1,
          isToday: X === P
        });
      }
      for (let G = 1; G <= z.getDate(); G++) {
        const H = new Date(I, S, G), X = b(H);
        K.push({
          date: X,
          day: G,
          isCurrentMonth: !0,
          isToday: X === P
        });
      }
      const U = 42 - K.length;
      for (let G = 1; G <= U; G++) {
        const H = new Date(I, S + 1, G), X = b(H);
        K.push({
          date: X,
          day: G,
          isCurrentMonth: !1,
          isToday: X === P
        });
      }
      return K;
    }), b = (I) => {
      const S = I.getFullYear(), M = String(I.getMonth() + 1).padStart(2, "0"), P = String(I.getDate()).padStart(2, "0");
      return `${S}-${M}-${P}`;
    }, h = (I) => !!(t.min && I < t.min || t.max && I > t.max), g = () => {
      t.disabled || (o.value = !o.value);
    }, y = () => {
      i.value = new Date(i.value.getFullYear(), i.value.getMonth() - 1, 1);
    }, v = () => {
      i.value = new Date(i.value.getFullYear(), i.value.getMonth() + 1, 1);
    }, p = (I) => {
      h(I) || (a("update:modelValue", I), a("change", I), o.value = !1);
    }, $ = (I) => {
      I.target.closest(".fluent-calendar-date-picker") || (o.value = !1);
    };
    return J(() => t.modelValue, (I) => {
      I && (i.value = new Date(I));
    }), re(() => {
      document.addEventListener("click", $), t.modelValue && (i.value = new Date(t.modelValue));
    }), ce(() => {
      document.removeEventListener("click", $);
    }), (I, S) => (n(), l("div", {
      class: w(["fluent-calendar-date-picker", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", rn, k(e.label), 1)) : f("", !0),
      u("div", un, [
        u("div", {
          class: "calendar-date-picker-input",
          onClick: g
        }, [
          u("span", {
            class: w(["input-text", { "has-value": d.value }])
          }, k(d.value || e.placeholder), 3),
          F(C, {
            icon: "calendar-16-regular",
            width: 16,
            class: "input-icon"
          })
        ]),
        F(te, { name: "dropdown" }, {
          default: Y(() => [
            o.value ? (n(), l("div", cn, [
              u("div", dn, [
                u("button", {
                  class: "nav-button",
                  onClick: y
                }, [
                  F(C, {
                    icon: "chevron-left-20-regular",
                    width: 16
                  })
                ]),
                u("span", fn, k(c.value), 1),
                u("button", {
                  class: "nav-button",
                  onClick: v
                }, [
                  F(C, {
                    icon: "chevron-right-20-regular",
                    width: 16
                  })
                ])
              ]),
              u("div", mn, [
                (n(), l(O, null, j(r, (M) => u("span", {
                  key: M,
                  class: "weekday"
                }, k(M), 1)), 64))
              ]),
              u("div", vn, [
                (n(!0), l(O, null, j(m.value, (M) => (n(), l("button", {
                  key: M.date,
                  class: w(["day-button", {
                    "is-today": M.isToday,
                    "is-selected": M.date === e.modelValue,
                    "is-other-month": !M.isCurrentMonth,
                    "is-disabled": h(M.date)
                  }]),
                  disabled: h(M.date),
                  onClick: (P) => p(M.date)
                }, k(M.day), 11, pn))), 128))
              ])
            ])) : f("", !0)
          ]),
          _: 1
        })
      ]),
      e.error ? (n(), l("div", hn, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", yn, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, gn = /* @__PURE__ */ B(bn, [["__scopeId", "data-v-27511c33"]]), kn = {
  __name: "FluentCanvas",
  props: {
    width: { type: [Number, String], default: "auto" },
    height: { type: [Number, String], default: "auto" },
    background: { type: String, default: "transparent" }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => ({
      width: t(s.width),
      height: t(s.height),
      background: s.background
    }));
    return (o, i) => (n(), l("div", {
      class: "fluent-canvas",
      style: D(a.value)
    }, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}, $n = /* @__PURE__ */ B(kn, [["__scopeId", "data-v-16d10cb3"]]), wn = {
  __name: "FluentCard",
  props: {
    hoverable: { type: Boolean, default: !1 },
    material: { type: String, default: "acrylic" }
  },
  emits: ["click"],
  setup(e) {
    return (s, t) => (n(), l("div", {
      class: w(["fluent-card", `material-${e.material}`, { hoverable: e.hoverable, padding: !0 }]),
      onClick: t[0] || (t[0] = (a) => s.$emit("click", a))
    }, [
      N(s.$slots, "default", {}, void 0, !0)
    ], 2));
  }
}, Xe = /* @__PURE__ */ B(wn, [["__scopeId", "data-v-175751b6"]]), _n = ["onKeydown"], Sn = { class: "checkbox-box" }, xn = {
  key: 1,
  class: "checkbox-indeterminate"
}, Cn = {
  key: 0,
  class: "checkbox-label"
}, Fn = {
  __name: "FluentCheckBox",
  props: {
    modelValue: { type: [Boolean, null], default: void 0 },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    indeterminate: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x(() => t.modelValue === !0), i = x(() => t.indeterminate && t.modelValue === null), r = () => {
      if (t.disabled) return;
      let c;
      t.indeterminate ? t.modelValue === null ? c = !0 : t.modelValue === !0 ? c = !1 : c = null : c = !t.modelValue, a("update:modelValue", c), a("change", c);
    };
    return (c, d) => (n(), l("div", {
      class: w(["fluent-checkbox", {
        "is-checked": o.value,
        "is-indeterminate": i.value,
        "is-disabled": e.disabled
      }]),
      onClick: r,
      onKeydown: [
        ye(ee(r, ["prevent"]), ["space"]),
        ye(ee(r, ["prevent"]), ["enter"])
      ]
    }, [
      u("div", Sn, [
        o.value ? (n(), L(C, {
          key: 0,
          icon: "checkmark-16-regular",
          width: 12,
          class: "checkbox-check"
        })) : i.value ? (n(), l("div", xn)) : f("", !0)
      ]),
      e.label || c.$slots.default ? (n(), l("label", Cn, [
        N(c.$slots, "default", {}, () => [
          oe(k(e.label), 1)
        ], !0)
      ])) : f("", !0)
    ], 42, _n));
  }
}, pe = /* @__PURE__ */ B(Fn, [["__scopeId", "data-v-505e4c71"]]), Vn = {
  __name: "FluentCol",
  props: {
    span: { type: Number, default: 24 },
    offset: { type: Number, default: 0 },
    push: { type: Number, default: 0 },
    pull: { type: Number, default: 0 }
  },
  setup(e) {
    const s = e, t = x(() => ({
      flex: `0 0 ${s.span / 24 * 100}%`,
      maxWidth: `${s.span / 24 * 100}%`,
      marginLeft: s.offset ? `${s.offset / 24 * 100}%` : "",
      position: s.push || s.pull ? "relative" : "",
      left: s.push ? `${s.push / 24 * 100}%` : "",
      right: s.pull ? `${s.pull / 24 * 100}%` : ""
    }));
    return (a, o) => (n(), l("div", {
      class: "fluent-col",
      style: D(t.value)
    }, [
      N(a.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}, In = /* @__PURE__ */ B(Vn, [["__scopeId", "data-v-7db1a7f8"]]), Bn = {
  key: 0,
  class: "color-picker-label"
}, Mn = { class: "color-picker-container" }, Tn = { class: "color-picker-input-wrapper" }, Pn = ["value", "disabled"], Rn = { class: "color-sliders" }, Nn = { class: "slider-row" }, zn = { class: "hue-track" }, An = { class: "slider-row" }, En = { class: "color-inputs" }, Ln = { class: "input-group" }, Dn = ["value"], On = { class: "input-group" }, Kn = ["value"], qn = { class: "input-group" }, Hn = ["value"], jn = { class: "input-group" }, Wn = ["value"], Gn = {
  key: 0,
  class: "color-presets"
}, Un = ["onClick"], Yn = {
  key: 1,
  class: "color-picker-error"
}, Xn = {
  key: 2,
  class: "color-picker-description"
}, Zn = {
  __name: "FluentColorPicker",
  props: {
    modelValue: { type: String, default: "#0078d4" },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    showPresets: { type: Boolean, default: !0 },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(null), r = _(null), c = _(!1), d = _({}), m = _(0), b = _(100), h = _(!1), g = _(""), y = _(null), v = [
      "#ff0000",
      "#ff4500",
      "#ffa500",
      "#ffd700",
      "#ffff00",
      "#9acd32",
      "#32cd32",
      "#008000",
      "#006400",
      "#008b8b",
      "#0000ff",
      "#00008b",
      "#4b0082",
      "#800080",
      "#ff00ff",
      "#ff1493",
      "#ff69b4",
      "#d2691e",
      "#8b4513",
      "#000000",
      "#808080",
      "#c0c0c0",
      "#ffffff"
    ], p = x(() => t.modelValue), $ = x(() => P(t.modelValue)), I = x(() => {
      const T = P(t.modelValue);
      return `linear-gradient(to right, rgba(${T.r},${T.g},${T.b},0), rgba(${T.r},${T.g},${T.b},1))`;
    }), S = x(() => {
      const T = K($.value.r, $.value.g, $.value.b);
      return {
        left: `${T.s * 100}%`,
        top: `${(1 - T.v) * 100}%`
      };
    }), M = x(() => `${m.value / 360 * 100}%`), P = (T) => {
      const A = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(T);
      return A ? {
        r: parseInt(A[1], 16),
        g: parseInt(A[2], 16),
        b: parseInt(A[3], 16)
      } : { r: 0, g: 0, b: 0 };
    }, R = (T, A, q) => "#" + [T, A, q].map((Z) => {
      const Q = Math.max(0, Math.min(255, Math.round(Z))).toString(16);
      return Q.length === 1 ? "0" + Q : Q;
    }).join(""), z = (T, A, q) => {
      const Z = q * A, Q = Z * (1 - Math.abs(T / 60 % 2 - 1)), ae = q - Z, [ie, Se, xe] = T < 60 ? [Z, Q, 0] : T < 120 ? [Q, Z, 0] : T < 180 ? [0, Z, Q] : T < 240 ? [0, Q, Z] : T < 300 ? [Q, 0, Z] : [Z, 0, Q];
      return { r: (ie + ae) * 255, g: (Se + ae) * 255, b: (xe + ae) * 255 };
    }, K = (T, A, q) => {
      T /= 255, A /= 255, q /= 255;
      const Z = Math.max(T, A, q), Q = Math.min(T, A, q), ae = Z - Q;
      let ie = 0;
      return ae && (Z === T ? ie = 60 * ((A - q) / ae % 6) : Z === A ? ie = 60 * ((q - T) / ae + 2) : ie = 60 * ((T - A) / ae + 4)), ie < 0 && (ie += 360), { h: ie, s: Z ? ae / Z : 0, v: Z };
    }, E = () => {
      const T = o.value, A = T == null ? void 0 : T.getContext("2d");
      if (!T || !A) return;
      const q = z(m.value, 1, 1), Z = A.createLinearGradient(0, 0, T.width, 0);
      Z.addColorStop(0, "#fff"), Z.addColorStop(1, `rgb(${q.r}, ${q.g}, ${q.b})`), A.fillStyle = Z, A.fillRect(0, 0, T.width, T.height);
      const Q = A.createLinearGradient(0, 0, 0, T.height);
      Q.addColorStop(0, "rgba(255,255,255,0)"), Q.addColorStop(1, "rgba(255,255,255,1)"), A.fillStyle = Q, A.fillRect(0, 0, T.width, T.height);
      const ae = A.createLinearGradient(0, 0, 0, T.height);
      ae.addColorStop(0, "rgba(0,0,0,0)"), ae.addColorStop(1, "rgba(0,0,0,1)"), A.fillStyle = ae, A.fillRect(0, 0, T.width, T.height);
    }, U = () => {
      t.disabled || (c.value = !c.value);
    }, G = () => {
      var Ie;
      const T = (Ie = i.value) == null ? void 0 : Ie.getBoundingClientRect(), A = r.value;
      if (!T || !A) return;
      const q = 8, Z = Math.min(A.offsetWidth || 304, window.innerWidth - q * 2), Q = A.offsetHeight || 430, ae = window.innerHeight - T.bottom - q, ie = T.top - q, Se = ae >= Q || ae >= ie ? Math.min(window.innerHeight - Q - q, T.bottom + 4) : Math.max(q, T.top - Q - 4), xe = Math.max(q, Math.min(T.left, window.innerWidth - Z - q));
      d.value = { top: `${Se}px`, left: `${xe}px`, maxWidth: `calc(100vw - ${q * 2}px)` };
    }, H = (T) => {
      const A = T.target.value;
      /^#[0-9a-fA-F]{6}$/.test(A) && (a("update:modelValue", A), a("change", A));
    }, X = (T) => {
      ke("spectrum", T), le(T);
    }, ne = () => {
      h.value = !1, g.value = "", y.value = null;
    }, le = (T) => {
      const A = o.value;
      if (!A) return;
      const q = A.getBoundingClientRect(), Z = Math.max(0, Math.min(1, (T.clientX - q.left) / q.width)), Q = Math.max(0, Math.min(1, (T.clientY - q.top) / q.height)), ae = z(m.value, Z, 1 - Q), ie = R(ae.r, ae.g, ae.b);
      a("update:modelValue", ie), a("change", ie);
    }, ue = (T) => {
      ke("hue", T), $e(T);
    }, de = (T) => {
      ke("alpha", T), me(T);
    }, ke = (T, A) => {
      h.value = !0, g.value = T, y.value = A.currentTarget;
    }, $e = (T) => {
      var q;
      const A = (q = y.value) == null ? void 0 : q.getBoundingClientRect();
      A && (m.value = Math.round(Math.max(0, Math.min(1, (T.clientX - A.left) / A.width)) * 360), E());
    }, me = (T) => {
      var q;
      const A = (q = y.value) == null ? void 0 : q.getBoundingClientRect();
      A && (b.value = Math.round(Math.max(0, Math.min(1, (T.clientX - A.left) / A.width)) * 100));
    }, Ve = (T) => {
      h.value && (g.value === "spectrum" ? le(T) : g.value === "hue" ? $e(T) : g.value === "alpha" && me(T));
    }, Be = (T) => {
      const A = T.target.value;
      /^#[0-9a-fA-F]{6}$/.test(A) && (a("update:modelValue", A), a("change", A));
    }, we = (T, A) => {
      const q = parseInt(A.target.value);
      if (isNaN(q)) return;
      const Z = P(t.modelValue);
      Z[T] = Math.max(0, Math.min(255, q));
      const Q = R(Z.r, Z.g, Z.b);
      a("update:modelValue", Q), a("change", Q);
    }, Me = (T) => {
      a("update:modelValue", T), a("change", T);
    }, _e = (T) => {
      var A;
      !T.target.closest(".fluent-color-picker") && !((A = r.value) != null && A.contains(T.target)) && (c.value = !1);
    };
    return J(c, async (T) => {
      T && (await ve(), E(), G());
    }), J(() => t.modelValue, (T) => {
      const A = P(T), q = K(A.r, A.g, A.b);
      h.value || (m.value = q.h);
    }), re(() => {
      document.addEventListener("click", _e);
      const T = P(t.modelValue);
      m.value = K(T.r, T.g, T.b).h, E(), document.addEventListener("pointermove", Ve), document.addEventListener("pointerup", ne), window.addEventListener("resize", G), window.addEventListener("scroll", G, !0);
    }), ce(() => {
      document.removeEventListener("click", _e), document.removeEventListener("pointermove", Ve), document.removeEventListener("pointerup", ne), window.removeEventListener("resize", G), window.removeEventListener("scroll", G, !0);
    }), (T, A) => (n(), l("div", {
      class: w(["fluent-color-picker", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", Bn, k(e.label), 1)) : f("", !0),
      u("div", Mn, [
        u("div", Tn, [
          u("div", {
            ref_key: "previewRef",
            ref: i,
            class: "color-preview",
            style: D({ background: e.modelValue }),
            onClick: U
          }, null, 4),
          u("input", {
            type: "text",
            class: "color-input",
            value: e.modelValue,
            disabled: e.disabled,
            onInput: H,
            onChange: H
          }, null, 40, Pn)
        ]),
        F(te, { name: "dropdown" }, {
          default: Y(() => [
            (n(), L(fe, { to: "body" }, [
              c.value ? (n(), l("div", {
                key: 0,
                ref_key: "dropdownRef",
                ref: r,
                class: "color-picker-dropdown",
                style: D(d.value)
              }, [
                u("div", {
                  class: "color-spectrum",
                  onPointerdown: X
                }, [
                  u("canvas", {
                    ref_key: "spectrumRef",
                    ref: o,
                    class: "spectrum-canvas",
                    width: "256",
                    height: "150"
                  }, null, 512),
                  u("div", {
                    class: "spectrum-thumb",
                    style: D(S.value)
                  }, null, 4)
                ], 32),
                u("div", Rn, [
                  u("div", Nn, [
                    A[3] || (A[3] = u("span", { class: "slider-label" }, "色相", -1)),
                    u("div", {
                      class: "hue-slider",
                      onPointerdown: ue
                    }, [
                      u("div", zn, [
                        u("div", {
                          class: "slider-thumb",
                          style: D({ left: M.value })
                        }, null, 4)
                      ])
                    ], 32)
                  ]),
                  u("div", An, [
                    A[4] || (A[4] = u("span", { class: "slider-label" }, "透明度", -1)),
                    u("div", {
                      class: "alpha-slider",
                      onPointerdown: de
                    }, [
                      u("div", {
                        class: "alpha-track",
                        style: D({ background: I.value })
                      }, [
                        u("div", {
                          class: "slider-thumb",
                          style: D({ left: `${b.value}%` })
                        }, null, 4)
                      ], 4)
                    ], 32)
                  ])
                ]),
                u("div", En, [
                  u("div", Ln, [
                    A[5] || (A[5] = u("label", null, "HEX", -1)),
                    u("input", {
                      type: "text",
                      value: p.value,
                      onChange: Be
                    }, null, 40, Dn)
                  ]),
                  u("div", On, [
                    A[6] || (A[6] = u("label", null, "R", -1)),
                    u("input", {
                      type: "number",
                      value: $.value.r,
                      min: "0",
                      max: "255",
                      onChange: A[0] || (A[0] = (q) => we("r", q))
                    }, null, 40, Kn)
                  ]),
                  u("div", qn, [
                    A[7] || (A[7] = u("label", null, "G", -1)),
                    u("input", {
                      type: "number",
                      value: $.value.g,
                      min: "0",
                      max: "255",
                      onChange: A[1] || (A[1] = (q) => we("g", q))
                    }, null, 40, Hn)
                  ]),
                  u("div", jn, [
                    A[8] || (A[8] = u("label", null, "B", -1)),
                    u("input", {
                      type: "number",
                      value: $.value.b,
                      min: "0",
                      max: "255",
                      onChange: A[2] || (A[2] = (q) => we("b", q))
                    }, null, 40, Wn)
                  ])
                ]),
                e.showPresets ? (n(), l("div", Gn, [
                  (n(), l(O, null, j(v, (q) => u("div", {
                    key: q,
                    class: "preset-color",
                    style: D({ background: q }),
                    onClick: (Z) => Me(q)
                  }, null, 12, Un)), 64))
                ])) : f("", !0)
              ], 4)) : f("", !0)
            ]))
          ]),
          _: 1
        })
      ]),
      e.error ? (n(), l("div", Yn, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", Xn, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, Qn = /* @__PURE__ */ B(Zn, [["__scopeId", "data-v-c866d8e7"]]), Jn = {
  key: 0,
  class: "combo-box-label"
}, el = ["value", "placeholder", "disabled"], tl = {
  key: 0,
  class: "combo-box-dropdown"
}, nl = { class: "dropdown-items" }, ll = ["onClick", "onMouseenter"], al = {
  key: 1,
  class: "combo-box-error"
}, ol = {
  key: 2,
  class: "combo-box-description"
}, sl = {
  __name: "FluentComboBox",
  props: {
    modelValue: { type: [String, Number, Object], default: null },
    items: { type: Array, required: !0 },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "请选择" },
    labelKey: { type: String, default: "label" },
    valueKey: { type: String, default: "value" },
    disabled: { type: Boolean, default: !1 },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(null), r = _(!1), c = _(-1), d = x(() => {
      if (!t.modelValue) return "";
      if (typeof t.modelValue == "object")
        return t.modelValue[t.labelKey] || "";
      const p = t.items.find(($) => b($) === t.modelValue);
      return p ? m(p) : "";
    }), m = (p) => typeof p == "string" ? p : p[t.labelKey] || "", b = (p) => typeof p == "string" ? p : p[t.valueKey] || p, h = (p) => t.modelValue ? typeof t.modelValue == "object" ? t.modelValue[t.valueKey] === b(p) : t.modelValue === b(p) : !1, g = () => {
      t.disabled || (r.value = !r.value, r.value && (c.value = t.items.findIndex((p) => h(p))));
    }, y = (p) => {
      const $ = b(p);
      a("update:modelValue", $), a("change", $), r.value = !1;
    }, v = (p) => {
      p.target.closest(".fluent-combo-box") || (r.value = !1);
    };
    return re(() => {
      document.addEventListener("click", v);
    }), ce(() => {
      document.removeEventListener("click", v);
    }), (p, $) => (n(), l("div", {
      class: w(["fluent-combo-box", { "is-open": r.value, "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", Jn, k(e.label), 1)) : f("", !0),
      u("div", {
        class: "combo-box-container",
        ref_key: "containerRef",
        ref: o
      }, [
        u("div", {
          class: "combo-box-input",
          onClick: g
        }, [
          u("input", {
            ref_key: "inputRef",
            ref: i,
            type: "text",
            value: d.value,
            placeholder: e.placeholder,
            disabled: e.disabled,
            readonly: "",
            class: "combo-box-field"
          }, null, 8, el),
          F(C, {
            icon: "chevron-down-20-regular",
            width: 16,
            class: "combo-box-chevron"
          })
        ]),
        F(te, { name: "dropdown" }, {
          default: Y(() => [
            r.value ? (n(), l("div", tl, [
              u("div", nl, [
                (n(!0), l(O, null, j(e.items, (I, S) => (n(), l("div", {
                  key: S,
                  class: w(["dropdown-item", { "is-selected": h(I), "is-highlighted": c.value === S }]),
                  onClick: (M) => y(I),
                  onMouseenter: (M) => c.value = S
                }, [
                  N(p.$slots, "item", { item: I }, () => [
                    u("span", null, k(m(I)), 1)
                  ], !0)
                ], 42, ll))), 128))
              ])
            ])) : f("", !0)
          ]),
          _: 3
        })
      ], 512),
      e.error ? (n(), l("div", al, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", ol, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, il = /* @__PURE__ */ B(sl, [["__scopeId", "data-v-ed1946b0"]]), rl = { class: "fluent-command-bar" }, ul = { class: "command-bar-primary" }, cl = { class: "command-bar-primary-content" }, dl = {
  key: 0,
  class: "command-separator"
}, fl = ["disabled", "onClick"], ml = {
  key: 1,
  class: "command-label"
}, vl = { class: "command-bar-secondary" }, pl = {
  key: 0,
  class: "command-separator"
}, hl = ["disabled", "onClick"], yl = { class: "command-label" }, bl = {
  __name: "FluentCommandBar",
  props: {
    primaryCommands: { type: Array, default: () => [] },
    secondaryCommands: { type: Array, default: () => [] },
    showLabels: { type: Boolean, default: !0 }
  },
  emits: ["command-click"],
  setup(e, { emit: s }) {
    const t = s, a = _(!1), o = () => {
      a.value = !a.value;
    }, i = () => {
      a.value = !1;
    }, r = (c) => {
      c.disabled || (i(), t("command-click", c));
    };
    return (c, d) => (n(), l("div", rl, [
      u("div", ul, [
        u("div", cl, [
          (n(!0), l(O, null, j(e.primaryCommands, (m, b) => (n(), l(O, { key: b }, [
            m.type === "separator" ? (n(), l("div", dl)) : (n(), l("button", {
              key: 1,
              class: w(["command-button", { "is-disabled": m.disabled }]),
              disabled: m.disabled,
              onClick: (h) => r(m)
            }, [
              m.icon ? (n(), L(C, {
                key: 0,
                icon: m.icon,
                width: 20
              }, null, 8, ["icon"])) : f("", !0),
              m.label && e.showLabels ? (n(), l("span", ml, k(m.label), 1)) : f("", !0)
            ], 10, fl))
          ], 64))), 128))
        ]),
        e.secondaryCommands.length > 0 ? (n(), l("button", {
          key: 0,
          class: w(["command-bar-overflow", { "is-open": a.value }]),
          onClick: o
        }, [
          F(C, {
            icon: "more-horizontal-20-regular",
            width: 20
          })
        ], 2)) : f("", !0)
      ]),
      F(te, { name: "overflow" }, {
        default: Y(() => [
          a.value ? (n(), l("div", {
            key: 0,
            class: "command-bar-overflow-overlay",
            onClick: ee(i, ["self"])
          }, [
            u("div", vl, [
              (n(!0), l(O, null, j(e.secondaryCommands, (m, b) => (n(), l(O, { key: b }, [
                m.type === "separator" ? (n(), l("div", pl)) : (n(), l("button", {
                  key: 1,
                  class: w(["command-button command-button-secondary", { "is-disabled": m.disabled }]),
                  disabled: m.disabled,
                  onClick: (h) => r(m)
                }, [
                  m.icon ? (n(), L(C, {
                    key: 0,
                    icon: m.icon,
                    width: 20
                  }, null, 8, ["icon"])) : f("", !0),
                  u("span", yl, k(m.label), 1)
                ], 10, hl))
              ], 64))), 128))
            ])
          ])) : f("", !0)
        ]),
        _: 1
      })
    ]));
  }
}, gl = /* @__PURE__ */ B(bl, [["__scopeId", "data-v-a53f6dd0"]]), kl = {
  key: 0,
  class: "dialog-header"
}, $l = {
  key: 0,
  class: "header-icon"
}, wl = { class: "header-text" }, _l = {
  key: 0,
  class: "dialog-title"
}, Sl = {
  key: 1,
  class: "dialog-subtitle"
}, xl = { class: "dialog-body" }, Cl = {
  key: 1,
  class: "dialog-footer"
}, Fl = {
  __name: "FluentContentDialog",
  props: {
    modelValue: { type: Boolean, default: !1 },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    icon: { type: String, default: "" },
    size: { type: String, default: "standard" },
    // standard, large, fullscreen
    closable: { type: Boolean, default: !0 },
    closeOnOverlay: { type: Boolean, default: !0 },
    closeOnEscape: { type: Boolean, default: !0 },
    primaryButtonText: { type: String, default: "" },
    secondaryButtonText: { type: String, default: "" }
  },
  emits: ["update:modelValue", "close", "primary-click", "secondary-click"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = () => {
      a("update:modelValue", !1), a("close");
    }, i = () => {
      a("primary-click"), o();
    }, r = () => {
      a("secondary-click"), o();
    }, c = (d) => {
      d.key === "Escape" && t.closeOnEscape && t.modelValue && o();
    };
    return J(() => t.modelValue, (d) => {
      d ? (document.addEventListener("keydown", c), document.body.style.overflow = "hidden") : (document.removeEventListener("keydown", c), document.body.style.overflow = "");
    }), (d, m) => (n(), L(fe, { to: "body" }, [
      F(te, { name: "dialog" }, {
        default: Y(() => [
          e.modelValue ? (n(), l("div", {
            key: 0,
            class: "fluent-content-dialog-overlay",
            onClick: m[0] || (m[0] = ee((b) => e.closeOnOverlay && o(), ["self"]))
          }, [
            u("div", {
              class: w(["fluent-content-dialog", [`size-${e.size}`]])
            }, [
              e.title || e.icon ? (n(), l("div", kl, [
                e.icon ? (n(), l("div", $l, [
                  F(C, {
                    icon: e.icon,
                    width: 24
                  }, null, 8, ["icon"])
                ])) : f("", !0),
                u("div", wl, [
                  e.title ? (n(), l("h2", _l, k(e.title), 1)) : f("", !0),
                  e.subtitle ? (n(), l("p", Sl, k(e.subtitle), 1)) : f("", !0)
                ]),
                e.closable ? (n(), l("button", {
                  key: 1,
                  class: "dialog-close",
                  onClick: o
                }, [
                  F(C, {
                    icon: "dismiss-16-regular",
                    width: 16
                  })
                ])) : f("", !0)
              ])) : f("", !0),
              u("div", xl, [
                N(d.$slots, "default", {}, void 0, !0)
              ]),
              d.$slots.footer || e.primaryButtonText || e.secondaryButtonText ? (n(), l("div", Cl, [
                N(d.$slots, "footer", {}, () => [
                  e.secondaryButtonText ? (n(), L(be, {
                    key: 0,
                    variant: "secondary",
                    onClick: r
                  }, {
                    default: Y(() => [
                      oe(k(e.secondaryButtonText), 1)
                    ]),
                    _: 1
                  })) : f("", !0),
                  e.primaryButtonText ? (n(), L(be, {
                    key: 1,
                    variant: "primary",
                    onClick: i
                  }, {
                    default: Y(() => [
                      oe(k(e.primaryButtonText), 1)
                    ]),
                    _: 1
                  })) : f("", !0)
                ], !0)
              ])) : f("", !0)
            ], 2)
          ])) : f("", !0)
        ]),
        _: 3
      })
    ]));
  }
}, Vl = /* @__PURE__ */ B(Fl, [["__scopeId", "data-v-87b8b423"]]), Il = { class: "control-example-root" }, Bl = {
  key: 0,
  class: "control-example-header"
}, Ml = { class: "control-example-frame" }, Tl = { class: "example-container" }, Pl = ["data-theme"], Rl = {
  key: 0,
  class: "example-options"
}, Nl = {
  key: 0,
  class: "code-expander"
}, zl = { class: "source-code-header" }, Al = { class: "source-code-content" }, El = {
  __name: "FluentControlExample",
  props: {
    headerText: { type: String, default: "" },
    theme: { type: String, default: "light" },
    sourceCode: { type: String, default: "" },
    showSourceCode: { type: Boolean, default: !0 }
  },
  setup(e) {
    const s = e, t = yt(), a = x(() => !!t.options), o = () => {
      s.sourceCode && navigator.clipboard.writeText(s.sourceCode);
    };
    return (i, r) => (n(), l("section", Il, [
      e.headerText ? (n(), l("h3", Bl, k(e.headerText), 1)) : f("", !0),
      u("div", Ml, [
        u("div", Tl, [
          u("div", {
            class: "example-display",
            "data-theme": e.theme
          }, [
            N(i.$slots, "example", {}, () => [
              N(i.$slots, "default", {}, void 0, !0)
            ], !0)
          ], 8, Pl),
          a.value ? (n(), l("aside", Rl, [
            N(i.$slots, "options", {}, void 0, !0)
          ])) : f("", !0)
        ]),
        e.showSourceCode ? (n(), l("div", Nl, [
          F(Xe, { class: "source-code-card" }, {
            default: Y(() => [
              u("div", zl, [
                r[1] || (r[1] = u("span", null, "源代码", -1)),
                F(be, {
                  variant: "subtle",
                  size: "sm",
                  onClick: o
                }, {
                  default: Y(() => [
                    F(C, {
                      icon: "copy",
                      width: "14"
                    }),
                    r[0] || (r[0] = oe(" 复制 ", -1))
                  ]),
                  _: 1
                })
              ]),
              u("div", Al, [
                u("pre", null, [
                  u("code", null, k(e.sourceCode), 1)
                ])
              ])
            ]),
            _: 1
          })
        ])) : f("", !0)
      ])
    ]));
  }
}, Ll = /* @__PURE__ */ B(El, [["__scopeId", "data-v-56c19871"]]), Dl = {
  key: 0,
  class: "date-picker-label"
}, Ol = ["value", "min", "max", "disabled", "placeholder"], Kl = ["disabled"], ql = {
  key: 1,
  class: "date-picker-error"
}, Hl = {
  __name: "FluentDatePicker",
  props: {
    modelValue: { type: String, default: "" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "选择日期" },
    min: { type: String, default: "" },
    max: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    error: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = () => {
      if (!(t.disabled || !o.value)) {
        o.value.focus();
        try {
          typeof o.value.showPicker == "function" ? o.value.showPicker() : o.value.click();
        } catch {
        }
      }
    }, r = (d) => {
      a("update:modelValue", d.target.value);
    }, c = (d) => {
      a("change", d.target.value);
    };
    return (d, m) => (n(), l("div", {
      class: w(["fluent-date-picker", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", Dl, k(e.label), 1)) : f("", !0),
      u("div", {
        class: "date-picker-container",
        onClick: i
      }, [
        u("input", {
          ref_key: "inputRef",
          ref: o,
          type: "date",
          class: "date-picker-input",
          value: e.modelValue,
          min: e.min,
          max: e.max,
          disabled: e.disabled,
          placeholder: e.placeholder,
          onInput: r,
          onChange: c
        }, null, 40, Ol),
        u("button", {
          type: "button",
          class: "date-picker-button",
          disabled: e.disabled,
          "aria-label": "打开日期选择器",
          onClick: ee(i, ["stop"])
        }, [
          F(C, {
            icon: "calendar-16-regular",
            width: 16
          })
        ], 8, Kl)
      ]),
      e.error ? (n(), l("div", ql, k(e.error), 1)) : f("", !0)
    ], 2));
  }
}, jl = /* @__PURE__ */ B(Hl, [["__scopeId", "data-v-6206a6bb"]]), Wl = {
  key: 0,
  class: "data-grid-toolbar"
}, Gl = { class: "data-grid-container" }, Ul = { class: "data-grid-table" }, Yl = {
  key: 0,
  class: "grid-header-checkbox"
}, Xl = ["onClick"], Zl = { class: "header-content" }, Ql = { class: "header-label" }, Jl = {
  key: 1,
  class: "grid-header-actions"
}, ea = ["onClick"], ta = {
  key: 0,
  class: "grid-cell-checkbox"
}, na = {
  key: 1,
  class: "grid-cell-actions"
}, la = {
  key: 1,
  class: "data-grid-pagination"
}, aa = { class: "pagination-info" }, oa = { class: "pagination-controls" }, sa = ["disabled"], ia = { class: "pagination-page" }, ra = ["disabled"], ua = {
  __name: "FluentDataGrid",
  props: {
    data: { type: Array, required: !0 },
    columns: { type: Array, required: !0 },
    selectable: { type: Boolean, default: !1 },
    selectedRows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: !1 },
    paginated: { type: Boolean, default: !1 },
    pageSize: { type: Number, default: 10 }
  },
  emits: ["update:selectedRows", "row-click", "row-dblclick", "sort"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(""), i = _("asc"), r = _(1), c = x(() => t.data), d = x(() => {
      let P = [...c.value];
      if (o.value && P.sort((R, z) => {
        const K = R[o.value], E = z[o.value];
        return K < E ? i.value === "asc" ? -1 : 1 : K > E ? i.value === "asc" ? 1 : -1 : 0;
      }), t.paginated) {
        const R = (r.value - 1) * t.pageSize;
        P = P.slice(R, R + t.pageSize);
      }
      return P;
    }), m = x(() => Math.ceil(c.value.length / t.pageSize)), b = x(() => {
      const P = (r.value - 1) * t.pageSize + 1, R = Math.min(r.value * t.pageSize, c.value.length);
      return `${P}-${R}`;
    }), h = x(() => c.value.length > 0 && c.value.every((P) => t.selectedRows.includes(P))), g = (P) => t.selectedRows.includes(P), y = (P) => {
      t.selectable && a("row-click", P);
    }, v = () => {
      h.value ? a("update:selectedRows", []) : a("update:selectedRows", [...c.value]);
    }, p = (P) => {
      const R = [...t.selectedRows], z = R.indexOf(P);
      z > -1 ? R.splice(z, 1) : R.push(P), a("update:selectedRows", R);
    }, $ = (P) => {
      o.value === P.key ? i.value = i.value === "asc" ? "desc" : "asc" : (o.value = P.key, i.value = "asc"), a("sort", { key: o.value, direction: i.value });
    }, I = (P, R) => R.formatter ? R.formatter(P) : P == null ? "" : String(P), S = (P) => ({
      width: P.width || "auto",
      minWidth: P.minWidth || "auto",
      textAlign: P.align || "left"
    }), M = (P) => ({
      textAlign: P.align || "left"
    });
    return J(() => t.paginated, () => {
      r.value = 1;
    }), (P, R) => (n(), l("div", {
      class: w(["fluent-data-grid", { "is-loading": e.loading }])
    }, [
      P.$slots.toolbar ? (n(), l("div", Wl, [
        N(P.$slots, "toolbar", {}, void 0, !0)
      ])) : f("", !0),
      u("div", Gl, [
        u("table", Ul, [
          u("thead", null, [
            u("tr", null, [
              e.selectable ? (n(), l("th", Yl, [
                F(pe, {
                  "model-value": h.value,
                  "onUpdate:modelValue": v
                }, null, 8, ["model-value"])
              ])) : f("", !0),
              (n(!0), l(O, null, j(e.columns, (z, K) => (n(), l("th", {
                key: K,
                class: "grid-header-cell",
                style: D(S(z)),
                onClick: (E) => z.sortable && $(z)
              }, [
                u("div", Zl, [
                  u("span", Ql, k(z.label), 1),
                  z.sortable && o.value === z.key ? (n(), L(C, {
                    key: 0,
                    icon: i.value === "asc" ? "arrow-up-20-regular" : "arrow-down-20-regular",
                    width: 16,
                    class: "sort-icon"
                  }, null, 8, ["icon"])) : f("", !0)
                ])
              ], 12, Xl))), 128)),
              P.$slots.actions ? (n(), l("th", Jl, "操作")) : f("", !0)
            ])
          ]),
          u("tbody", null, [
            (n(!0), l(O, null, j(d.value, (z, K) => (n(), l("tr", {
              key: K,
              class: w(["grid-row", { "is-selected": g(z) }]),
              onClick: (E) => y(z)
            }, [
              e.selectable ? (n(), l("td", ta, [
                F(pe, {
                  "model-value": g(z),
                  "onUpdate:modelValue": (E) => p(z)
                }, null, 8, ["model-value", "onUpdate:modelValue"])
              ])) : f("", !0),
              (n(!0), l(O, null, j(e.columns, (E, U) => (n(), l("td", {
                key: U,
                class: "grid-cell",
                style: D(M(E))
              }, [
                N(P.$slots, `cell-${E.key}`, {
                  row: z,
                  value: z[E.key]
                }, () => [
                  u("span", null, k(I(z[E.key], E)), 1)
                ], !0)
              ], 4))), 128)),
              P.$slots.actions ? (n(), l("td", na, [
                N(P.$slots, "actions", { row: z }, void 0, !0)
              ])) : f("", !0)
            ], 10, ea))), 128))
          ])
        ])
      ]),
      e.paginated ? (n(), l("div", la, [
        u("div", aa, " 显示 " + k(b.value) + " 共 " + k(c.value.length) + " 条 ", 1),
        u("div", oa, [
          u("button", {
            class: "pagination-button",
            disabled: r.value <= 1,
            onClick: R[0] || (R[0] = (z) => r.value--)
          }, [
            F(C, {
              icon: "chevron-left-20-regular",
              width: 16
            })
          ], 8, sa),
          u("span", ia, k(r.value) + " / " + k(m.value), 1),
          u("button", {
            class: "pagination-button",
            disabled: r.value >= m.value,
            onClick: R[1] || (R[1] = (z) => r.value++)
          }, [
            F(C, {
              icon: "chevron-right-20-regular",
              width: 16
            })
          ], 8, ra)
        ])
      ])) : f("", !0)
    ], 2));
  }
}, ca = /* @__PURE__ */ B(ua, [["__scopeId", "data-v-8357a476"]]), da = {
  key: 0,
  class: "descriptions-title"
}, fa = { class: "item-label" }, ma = { class: "item-value" }, va = {
  __name: "FluentDescriptions",
  props: {
    title: { type: String, default: "" },
    items: { type: Array, required: !0 },
    column: { type: Number, default: 3 },
    layout: { type: String, default: "horizontal" },
    // horizontal, vertical
    size: { type: String, default: "medium" },
    // small, medium, large
    bordered: { type: Boolean, default: !1 }
  },
  setup(e) {
    const s = e, t = x(() => ({
      display: "grid",
      gridTemplateColumns: `repeat(${s.column}, 1fr)`
    }));
    return (a, o) => (n(), l("div", {
      class: w(["fluent-descriptions", [`layout-${e.layout}`, `size-${e.size}`]])
    }, [
      e.title ? (n(), l("div", da, k(e.title), 1)) : f("", !0),
      u("div", {
        class: "descriptions-content",
        style: D(t.value)
      }, [
        (n(!0), l(O, null, j(e.items, (i, r) => (n(), l("div", {
          key: r,
          class: w(["descriptions-item", { "is-bordered": e.bordered }])
        }, [
          u("div", fa, k(i.label), 1),
          u("div", ma, [
            N(a.$slots, i.key || `item-${r}`, { item: i }, () => [
              oe(k(i.value), 1)
            ], !0)
          ])
        ], 2))), 128))
      ], 4)
    ], 2));
  }
}, pa = /* @__PURE__ */ B(va, [["__scopeId", "data-v-330f4569"]]), ha = {
  __name: "FluentDivider",
  props: {
    orientation: { type: String, default: "horizontal" },
    // horizontal, vertical
    inset: { type: Boolean, default: !1 }
  },
  setup(e) {
    return (s, t) => (n(), l("div", {
      class: w(["fluent-divider", [`orientation-${e.orientation}`, { inset: e.inset }]]),
      role: "separator"
    }, null, 2));
  }
}, ya = /* @__PURE__ */ B(ha, [["__scopeId", "data-v-57ac23a4"]]), ba = {
  key: 0,
  class: "drawer-header"
}, ga = { class: "drawer-title" }, ka = { class: "drawer-body" }, $a = {
  key: 1,
  class: "drawer-footer"
}, wa = {
  __name: "FluentDrawer",
  props: {
    modelValue: { type: Boolean, default: !1 },
    title: { type: String, default: "" },
    placement: { type: String, default: "right" },
    // left, right, top, bottom
    size: { type: String, default: "medium" },
    // small, medium, large
    closable: { type: Boolean, default: !0 },
    closeOnOverlay: { type: Boolean, default: !0 },
    closeOnEscape: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = () => {
      a("update:modelValue", !1), a("close");
    }, i = (r) => {
      r.key === "Escape" && t.closeOnEscape && t.modelValue && o();
    };
    return J(() => t.modelValue, (r) => {
      r ? (document.addEventListener("keydown", i), document.body.style.overflow = "hidden", a("open")) : (document.removeEventListener("keydown", i), document.body.style.overflow = "");
    }), (r, c) => (n(), L(fe, { to: "body" }, [
      F(te, { name: "drawer" }, {
        default: Y(() => [
          e.modelValue ? (n(), l("div", {
            key: 0,
            class: "fluent-drawer-overlay",
            onClick: c[0] || (c[0] = ee((d) => e.closeOnOverlay && o(), ["self"]))
          }, [
            u("div", {
              class: w(["fluent-drawer", [`placement-${e.placement}`, `size-${e.size}`]])
            }, [
              e.title || e.closable ? (n(), l("div", ba, [
                N(r.$slots, "header", {}, () => [
                  u("h3", ga, k(e.title), 1)
                ], !0),
                e.closable ? (n(), l("button", {
                  key: 0,
                  class: "drawer-close",
                  onClick: o
                }, [
                  F(C, {
                    icon: "dismiss-16-regular",
                    width: 16
                  })
                ])) : f("", !0)
              ])) : f("", !0),
              u("div", ka, [
                N(r.$slots, "default", {}, void 0, !0)
              ]),
              r.$slots.footer ? (n(), l("div", $a, [
                N(r.$slots, "footer", {}, void 0, !0)
              ])) : f("", !0)
            ], 2)
          ])) : f("", !0)
        ]),
        _: 3
      })
    ]));
  }
}, _a = /* @__PURE__ */ B(wa, [["__scopeId", "data-v-782e6487"]]), Sa = ["disabled"], xa = {
  key: 0,
  class: "dropdown-flyout"
}, Ca = {
  key: 0,
  class: "flyout-separator"
}, Fa = ["disabled", "onClick"], Va = { class: "flyout-item-label" }, Ia = {
  __name: "FluentDropDownButton",
  props: {
    label: { type: String, default: "" },
    items: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["select"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1), i = () => {
      t.disabled || (o.value = !o.value);
    }, r = (d) => {
      d.disabled || (o.value = !1, a("select", d), d.click && d.click());
    }, c = (d) => {
      d.target.closest(".fluent-dropdown-button") || (o.value = !1);
    };
    return re(() => {
      document.addEventListener("click", c);
    }), ce(() => {
      document.removeEventListener("click", c);
    }), (d, m) => (n(), l("div", {
      class: w(["fluent-dropdown-button", { "is-open": o.value, "is-disabled": e.disabled }])
    }, [
      u("button", {
        class: "dropdown-button-main",
        disabled: e.disabled,
        onClick: i
      }, [
        N(d.$slots, "default", {}, () => [
          oe(k(e.label), 1)
        ], !0),
        F(C, {
          icon: "chevron-down-20-regular",
          width: 12,
          class: "dropdown-chevron"
        })
      ], 8, Sa),
      F(te, { name: "dropdown" }, {
        default: Y(() => [
          o.value ? (n(), l("div", xa, [
            (n(!0), l(O, null, j(e.items, (b, h) => (n(), l(O, { key: h }, [
              b.type === "separator" ? (n(), l("div", Ca)) : (n(), l("button", {
                key: 1,
                class: w(["flyout-item", { "is-disabled": b.disabled }]),
                disabled: b.disabled,
                onClick: (g) => r(b)
              }, [
                b.icon ? (n(), L(C, {
                  key: 0,
                  icon: b.icon,
                  width: 16
                }, null, 8, ["icon"])) : f("", !0),
                u("span", Va, k(b.label), 1)
              ], 10, Fa))
            ], 64))), 128))
          ])) : f("", !0)
        ]),
        _: 1
      })
    ], 2));
  }
}, Ba = /* @__PURE__ */ B(Ia, [["__scopeId", "data-v-6dbf3d71"]]), Ma = { class: "fluent-empty-state" }, Ta = {
  key: 0,
  class: "empty-state-icon"
}, Pa = {
  key: 1,
  class: "empty-state-title"
}, Ra = {
  key: 2,
  class: "empty-state-description"
}, Na = {
  key: 3,
  class: "empty-state-action"
}, za = {
  __name: "FluentEmptyState",
  props: {
    icon: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  setup(e) {
    return (s, t) => (n(), l("div", Ma, [
      e.icon ? (n(), l("div", Ta, [
        F(C, {
          icon: e.icon,
          width: 48
        }, null, 8, ["icon"])
      ])) : f("", !0),
      e.title ? (n(), l("div", Pa, k(e.title), 1)) : f("", !0),
      e.description ? (n(), l("div", Ra, k(e.description), 1)) : f("", !0),
      s.$slots.action ? (n(), l("div", Na, [
        N(s.$slots, "action", {}, void 0, !0)
      ])) : f("", !0)
    ]));
  }
}, Aa = /* @__PURE__ */ B(za, [["__scopeId", "data-v-783ea49d"]]), Ea = ["aria-expanded"], La = { class: "expander-header-main" }, Da = {
  key: 0,
  class: "expander-header-icon"
}, Oa = { class: "expander-header-content" }, Ka = { class: "expander-header-text" }, qa = {
  key: 0,
  class: "expander-description"
}, Ha = { class: "expander-chevron" }, ja = {
  key: 0,
  class: "expander-content"
}, Wa = {
  __name: "FluentExpander",
  props: {
    header: { type: String, required: !0 },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    expandUp: { type: Boolean, default: !1 },
    modelValue: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "expand", "collapse"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(t.modelValue);
    J(() => t.modelValue, (r) => {
      o.value = r;
    });
    const i = () => {
      o.value = !o.value, a("update:modelValue", o.value), o.value ? a("expand") : a("collapse");
    };
    return (r, c) => (n(), l("div", {
      class: w(["fluent-expander", { "is-expanded": o.value, "expand-up": e.expandUp }])
    }, [
      u("button", {
        class: "expander-header",
        onClick: i,
        "aria-expanded": o.value,
        type: "button"
      }, [
        u("div", La, [
          e.icon ? (n(), l("span", Da, [
            F(C, {
              icon: e.icon,
              width: 16
            }, null, 8, ["icon"])
          ])) : f("", !0),
          u("div", Oa, [
            u("div", Ka, k(e.header), 1),
            e.description ? (n(), l("div", qa, k(e.description), 1)) : f("", !0)
          ])
        ]),
        u("span", Ha, [
          F(C, {
            icon: "chevron-down-20-regular",
            width: 16
          })
        ])
      ], 8, Ea),
      F(te, { name: "expand" }, {
        default: Y(() => [
          o.value ? (n(), l("div", ja, [
            N(r.$slots, "default", {}, void 0, !0)
          ])) : f("", !0)
        ]),
        _: 3
      })
    ], 2));
  }
}, Ga = /* @__PURE__ */ B(Wa, [["__scopeId", "data-v-0b45d31e"]]), Ua = {
  key: 0,
  class: "float-button-menu"
}, Ya = ["onClick"], Xa = {
  key: 1,
  class: "menu-item-label"
}, Za = ["aria-label"], Qa = {
  __name: "FluentFloatButton",
  props: {
    icon: { type: String, default: "add-20-regular" },
    position: { type: String, default: "bottom-right" },
    // bottom-right, bottom-left, top-right, top-left
    menuItems: { type: Array, default: () => [] },
    ariaLabel: { type: String, default: "浮动操作按钮" }
  },
  emits: ["click", "menu-click"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1), i = () => {
      t.menuItems.length ? o.value = !o.value : a("click");
    }, r = (c) => {
      o.value = !1, a("menu-click", c), c.click && c.click();
    };
    return (c, d) => (n(), l("div", {
      class: w(["fluent-float-button", [`position-${e.position}`, { "is-expanded": o.value }]])
    }, [
      F(te, { name: "menu" }, {
        default: Y(() => [
          o.value && e.menuItems.length ? (n(), l("div", Ua, [
            (n(!0), l(O, null, j(e.menuItems, (m, b) => (n(), l("button", {
              key: b,
              class: "menu-item",
              onClick: (h) => r(m)
            }, [
              m.icon ? (n(), L(C, {
                key: 0,
                icon: m.icon,
                width: 20
              }, null, 8, ["icon"])) : f("", !0),
              m.label ? (n(), l("span", Xa, k(m.label), 1)) : f("", !0)
            ], 8, Ya))), 128))
          ])) : f("", !0)
        ]),
        _: 1
      }),
      u("button", {
        class: "float-button-main",
        onClick: i,
        "aria-label": e.ariaLabel
      }, [
        F(C, {
          icon: e.icon,
          width: 24
        }, null, 8, ["icon"])
      ], 8, Za)
    ], 2));
  }
}, Ja = /* @__PURE__ */ B(Qa, [["__scopeId", "data-v-1f417c27"]]), eo = {
  __name: "FluentFlipView",
  props: {
    items: { type: Array, required: !0 },
    modelValue: { type: Number, default: 0 },
    vertical: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1);
    let i = 0;
    const r = x(() => t.vertical ? { transform: `translateY(-${t.modelValue * 100}%)` } : { transform: `translateX(-${t.modelValue * 100}%)` }), c = (y) => {
      if (t.disabled) return;
      const v = Math.max(0, Math.min(t.items.length - 1, y));
      v !== t.modelValue && (a("update:modelValue", v), a("change", v));
    }, d = () => {
      t.modelValue > 0 && c(t.modelValue - 1);
    }, m = () => {
      t.modelValue < t.items.length - 1 && c(t.modelValue + 1);
    }, b = (y) => {
      if (t.disabled) return;
      const v = t.vertical ? y.deltaY : y.deltaX || y.deltaY;
      v > 0 ? m() : v < 0 && d();
    }, h = (y) => {
      const v = y.touches[0];
      i = t.vertical ? v.clientY : v.clientX;
    }, g = (y) => {
      const v = y.changedTouches[0], p = t.vertical ? v.clientY : v.clientX, $ = i - p;
      $ > 30 ? m() : $ < -30 && d();
    };
    return (y, v) => (n(), l("div", {
      class: w(["fluent-flip-view", { "is-vertical": e.vertical }]),
      onMouseenter: v[0] || (v[0] = (p) => o.value = !0),
      onMouseleave: v[1] || (v[1] = (p) => o.value = !1),
      onWheel: ee(b, ["prevent"]),
      onTouchstart: h,
      onTouchend: g
    }, [
      u("div", {
        class: "flip-view-track",
        style: D(r.value)
      }, [
        (n(!0), l(O, null, j(e.items, (p, $) => (n(), l("div", {
          key: $,
          class: "flip-view-item"
        }, [
          N(y.$slots, "default", {
            item: p,
            index: $
          }, void 0, !0)
        ]))), 128))
      ], 4),
      Ce(u("button", {
        class: "flip-button prev-button",
        onClick: d,
        "aria-label": "上一个"
      }, [
        F(C, {
          icon: e.vertical ? "chevron-up-20-regular" : "chevron-left-20-regular",
          width: 16
        }, null, 8, ["icon"])
      ], 512), [
        [Fe, o.value && e.modelValue > 0]
      ]),
      Ce(u("button", {
        class: "flip-button next-button",
        onClick: m,
        "aria-label": "下一个"
      }, [
        F(C, {
          icon: e.vertical ? "chevron-down-20-regular" : "chevron-right-20-regular",
          width: 16
        }, null, 8, ["icon"])
      ], 512), [
        [Fe, o.value && e.modelValue < e.items.length - 1]
      ])
    ], 34));
  }
}, to = /* @__PURE__ */ B(eo, [["__scopeId", "data-v-f4d20381"]]), no = {
  key: 0,
  class: "flyout-header"
}, lo = { class: "flyout-title" }, ao = { class: "flyout-content" }, oo = {
  key: 1,
  class: "flyout-footer"
}, so = {
  __name: "FluentFlyout",
  props: {
    modelValue: { type: Boolean, default: void 0 },
    title: { type: String, default: "" },
    placement: { type: String, default: "bottom" },
    closable: { type: Boolean, default: !0 },
    closeOnEscape: { type: Boolean, default: !0 },
    closeOnOverlay: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(null), r = _(!1), c = _({ top: 0, left: 0 }), d = x(() => t.modelValue ?? r.value), m = x(() => ({
      top: `${c.value.top}px`,
      left: `${c.value.left}px`
    })), b = () => {
      d.value ? g() : h();
    }, h = () => {
      r.value = !0, a("update:modelValue", !0), a("open"), ve(() => {
        y();
      });
    }, g = () => {
      r.value = !1, a("update:modelValue", !1), a("close");
    }, y = () => {
      if (!o.value || !i.value) return;
      const p = o.value.getBoundingClientRect(), $ = i.value.getBoundingClientRect(), I = 8;
      let S = 0, M = 0;
      switch (t.placement) {
        case "top":
          S = p.top - $.height - I, M = p.left + (p.width - $.width) / 2;
          break;
        case "bottom":
          S = p.bottom + I, M = p.left + (p.width - $.width) / 2;
          break;
        case "left":
          S = p.top + (p.height - $.height) / 2, M = p.left - $.width - I;
          break;
        case "right":
          S = p.top + (p.height - $.height) / 2, M = p.right + I;
          break;
      }
      S = Math.max(I, Math.min(S, window.innerHeight - $.height - I)), M = Math.max(I, Math.min(M, window.innerWidth - $.width - I)), c.value = { top: S, left: M };
    }, v = (p) => {
      p.key === "Escape" && t.closeOnEscape && d.value && g();
    };
    return J(() => t.modelValue, (p) => {
      p && ve(() => y());
    }), re(() => {
      document.addEventListener("keydown", v);
    }), ce(() => {
      document.removeEventListener("keydown", v);
    }), (p, $) => (n(), l("div", {
      class: "fluent-flyout-wrapper",
      ref_key: "wrapperRef",
      ref: o
    }, [
      u("div", {
        class: "flyout-trigger",
        onClick: b
      }, [
        N(p.$slots, "trigger", {}, () => [
          F(be, { onClick: b }, {
            default: Y(() => [...$[1] || ($[1] = [
              oe("打开弹出框", -1)
            ])]),
            _: 1
          })
        ], !0)
      ]),
      (n(), L(fe, { to: "body" }, [
        F(te, { name: "flyout" }, {
          default: Y(() => [
            d.value ? (n(), l("div", {
              key: 0,
              class: "fluent-flyout-overlay",
              onClick: $[0] || ($[0] = ee((...I) => e.closeOnOverlay && e.closeOnOverlay(...I), ["self"]))
            }, [
              u("div", {
                ref_key: "flyoutRef",
                ref: i,
                class: w(["fluent-flyout", [`placement-${e.placement}`]]),
                style: D(m.value)
              }, [
                e.title ? (n(), l("div", no, [
                  u("h3", lo, k(e.title), 1),
                  e.closable ? (n(), l("button", {
                    key: 0,
                    class: "flyout-close",
                    onClick: g
                  }, [
                    F(C, {
                      icon: "dismiss-16-regular",
                      width: 16
                    })
                  ])) : f("", !0)
                ])) : f("", !0),
                u("div", ao, [
                  N(p.$slots, "default", {}, void 0, !0)
                ]),
                p.$slots.footer ? (n(), l("div", oo, [
                  N(p.$slots, "footer", {}, void 0, !0)
                ])) : f("", !0)
              ], 6)
            ])) : f("", !0)
          ]),
          _: 3
        })
      ]))
    ], 512));
  }
}, io = /* @__PURE__ */ B(so, [["__scopeId", "data-v-34f79c3d"]]), ro = {
  __name: "FluentGrid",
  props: {
    columns: { type: [Number, String], default: 1 },
    rows: { type: [Number, String], default: "auto" },
    columnSpacing: { type: Number, default: 0 },
    rowSpacing: { type: Number, default: 0 },
    padding: { type: [String, Number], default: 0 }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => {
      const o = {
        display: "grid",
        padding: t(s.padding),
        columnGap: `${s.columnSpacing}px`,
        rowGap: `${s.rowSpacing}px`
      };
      return typeof s.columns == "number" ? o.gridTemplateColumns = `repeat(${s.columns}, 1fr)` : o.gridTemplateColumns = s.columns, typeof s.rows == "number" ? o.gridTemplateRows = `repeat(${s.rows}, 1fr)` : o.gridTemplateRows = s.rows, o;
    });
    return (o, i) => (n(), l("div", {
      class: "fluent-grid",
      style: D(a.value)
    }, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}, uo = /* @__PURE__ */ B(ro, [["__scopeId", "data-v-e35b965f"]]), co = ["draggable", "onClick", "onDblclick", "onDragstart", "onDragover", "onDrop"], fo = { class: "grid-item-default" }, mo = { class: "grid-item-label" }, vo = {
  __name: "FluentGridView",
  props: {
    items: { type: Array, required: !0 },
    columns: { type: Number, default: 4 },
    selectionMode: { type: String, default: "none" },
    // none, single, multiple
    selectedItems: { type: Array, default: () => [] },
    canDrag: { type: Boolean, default: !1 },
    canReorder: { type: Boolean, default: !1 },
    itemKey: { type: String, default: "id" },
    itemWidth: { type: [String, Number], default: "auto" }
  },
  emits: ["select", "invoke", "update:selectedItems", "reorder"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(!1), r = _([]), c = _(-1), d = x(() => ({
      display: "grid",
      gridTemplateColumns: t.itemWidth === "auto" ? `repeat(${t.columns}, 1fr)` : `repeat(auto-fill, minmax(${typeof t.itemWidth == "number" ? t.itemWidth + "px" : t.itemWidth}, 1fr))`,
      gap: "12px"
    })), m = (S, M) => typeof S == "object" && S !== null && S[t.itemKey] || M, b = (S) => t.selectedItems.some((M) => {
      if (typeof S == "object" && typeof M == "object") {
        const P = S[t.itemKey], R = M[t.itemKey];
        return P != null && R != null ? P === R : S === M;
      }
      return S === M;
    }), h = (S, M) => {
      if (t.selectionMode !== "none") {
        if (t.selectionMode === "single")
          a("update:selectedItems", [S]), a("select", { item: S, index: M, selected: [S] });
        else if (t.selectionMode === "multiple") {
          const P = [...t.selectedItems], R = P.findIndex((z) => {
            if (typeof S == "object" && typeof z == "object") {
              const K = S[t.itemKey], E = z[t.itemKey];
              return K != null && E != null ? K === E : S === z;
            }
            return S === z;
          });
          R > -1 ? P.splice(R, 1) : P.push(S), a("update:selectedItems", P), a("select", { item: S, index: M, selected: P });
        }
      }
    }, g = (S, M) => {
      a("invoke", { item: S, index: M });
    }, y = (S, M) => {
      const P = [...t.selectedItems], R = P.findIndex((z) => {
        if (typeof M == "object" && typeof z == "object") {
          const K = M[t.itemKey], E = z[t.itemKey];
          return K != null && E != null ? K === E : M === z;
        }
        return M === z;
      });
      S && R === -1 ? P.push(M) : !S && R > -1 && P.splice(R, 1), a("update:selectedItems", P);
    }, v = (S, M) => {
      t.canDrag && (i.value = !0, r.value = [M], S.dataTransfer.effectAllowed = "move");
    }, p = () => {
      i.value = !1, r.value = [], c.value = -1;
    }, $ = (S, M) => {
      t.canReorder && (c.value = M);
    }, I = (S, M) => {
      !t.canReorder || r.value.length === 0 || a("reorder", { from: r.value[0], to: M });
    };
    return (S, M) => (n(), l("div", {
      ref_key: "containerRef",
      ref: o,
      class: w(["fluent-grid-view", {
        "is-selectable": e.selectionMode !== "none",
        "is-dragging": i.value
      }])
    }, [
      u("div", {
        class: "grid-view-items",
        style: D(d.value)
      }, [
        (n(!0), l(O, null, j(e.items, (P, R) => (n(), l("div", {
          key: m(P, R),
          class: w(["grid-view-item", {
            "is-selected": b(P),
            "is-dragging-source": i.value && r.value.includes(R)
          }]),
          draggable: e.canDrag,
          onClick: (z) => h(P, R),
          onDblclick: (z) => g(P, R),
          onDragstart: (z) => v(z, R),
          onDragend: p,
          onDragover: ee((z) => $(z, R), ["prevent"]),
          onDrop: ee((z) => I(z, R), ["prevent"])
        }, [
          e.selectionMode === "multiple" ? (n(), l("div", {
            key: 0,
            class: "item-checkbox",
            onClick: M[0] || (M[0] = ee(() => {
            }, ["stop"]))
          }, [
            F(pe, {
              "model-value": b(P),
              "onUpdate:modelValue": (z) => y(z, P)
            }, null, 8, ["model-value", "onUpdate:modelValue"])
          ])) : f("", !0),
          N(S.$slots, "default", {
            item: P,
            index: R
          }, () => [
            u("div", fo, [
              P.icon ? (n(), L(C, {
                key: 0,
                icon: P.icon,
                width: 24
              }, null, 8, ["icon"])) : f("", !0),
              u("span", mo, k(P.label || P.title), 1)
            ])
          ], !0)
        ], 42, co))), 128))
      ], 4)
    ], 2));
  }
}, po = /* @__PURE__ */ B(vo, [["__scopeId", "data-v-7471ac23"]]), ho = { class: "scroll-content" }, yo = {
  __name: "FluentHorizontalScrollContainer",
  props: {
    scrollAmount: { type: Number, default: 200 }
  },
  setup(e) {
    const s = e, t = _(null), a = _(!1), o = _(!1), i = () => {
      if (!t.value) return;
      const { scrollLeft: m, scrollWidth: b, clientWidth: h } = t.value;
      a.value = m > 0, o.value = b > h + 1 && m < b - h - 1;
    }, r = () => {
      t.value && i();
    }, c = () => {
      t.value && t.value.scrollBy({ left: -s.scrollAmount, behavior: "smooth" });
    }, d = () => {
      t.value && t.value.scrollBy({ left: s.scrollAmount, behavior: "smooth" });
    };
    return re(() => {
      i(), window.addEventListener("resize", i);
    }), ce(() => {
      window.removeEventListener("resize", i);
    }), (m, b) => (n(), l("div", {
      class: "fluent-horizontal-scroll-container",
      ref_key: "containerRef",
      ref: t,
      onScroll: r
    }, [
      u("div", ho, [
        N(m.$slots, "default", {}, void 0, !0)
      ]),
      a.value ? (n(), l("button", {
        key: 0,
        class: "scroll-button left-button",
        onClick: c
      }, [
        F(C, {
          icon: "chevron-left-20-regular",
          width: 16
        })
      ])) : f("", !0),
      o.value ? (n(), l("button", {
        key: 1,
        class: "scroll-button right-button",
        onClick: d
      }, [
        F(C, {
          icon: "chevron-right-20-regular",
          width: 16
        })
      ])) : f("", !0)
    ], 544));
  }
}, bo = /* @__PURE__ */ B(yo, [["__scopeId", "data-v-362dd8ca"]]), go = ["href", "target", "rel", "aria-disabled"], ko = ["disabled"], $o = {
  __name: "FluentHyperlinkButton",
  props: {
    label: { type: String, default: "" },
    href: { type: String, default: "" },
    target: { type: String, default: "_self" },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["click"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = (i) => {
      if (t.disabled) {
        i.preventDefault();
        return;
      }
      a("click", i);
    };
    return (i, r) => e.href ? (n(), l("a", {
      key: 0,
      class: w(["fluent-hyperlink-button", { "is-disabled": e.disabled }]),
      href: e.disabled ? void 0 : e.href,
      target: e.target,
      rel: e.target === "_blank" ? "noopener noreferrer" : void 0,
      "aria-disabled": e.disabled,
      onClick: o
    }, [
      N(i.$slots, "default", {}, () => [
        oe(k(e.label), 1)
      ], !0)
    ], 10, go)) : (n(), l("button", {
      key: 1,
      class: w(["fluent-hyperlink-button", { "is-disabled": e.disabled }]),
      disabled: e.disabled,
      onClick: o
    }, [
      N(i.$slots, "default", {}, () => [
        oe(k(e.label), 1)
      ], !0)
    ], 10, ko));
  }
}, wo = /* @__PURE__ */ B($o, [["__scopeId", "data-v-b9d891b6"]]), _o = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], So = {
  class: "progress-ring-svg",
  viewBox: "0 0 100 100"
}, xo = {
  key: 1,
  class: "progress-ring-indeterminate",
  cx: "50",
  cy: "50",
  r: "42"
}, Co = {
  __name: "FluentProgressRing",
  props: {
    value: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    indeterminate: { type: Boolean, default: !0 },
    error: { type: Boolean, default: !1 },
    paused: { type: Boolean, default: !1 },
    size: { type: [Number, String], default: 32 }
  },
  setup(e) {
    const s = e, t = x(() => s.max === s.min ? 0 : (s.value - s.min) / (s.max - s.min) * 100), a = 2 * Math.PI * 42, o = x(() => a - t.value / 100 * a), i = x(() => ({
      strokeDasharray: `${a}`,
      strokeDashoffset: `${o.value}`
    })), r = x(() => ({
      width: typeof s.size == "number" ? `${s.size}px` : s.size,
      height: typeof s.size == "number" ? `${s.size}px` : s.size
    }));
    return (c, d) => (n(), l("div", {
      class: w(["fluent-progress-ring", {
        "is-indeterminate": e.indeterminate,
        "is-error": e.error,
        "is-paused": e.paused
      }]),
      style: D(r.value),
      role: "progressbar",
      "aria-valuenow": e.indeterminate ? void 0 : t.value,
      "aria-valuemin": e.indeterminate ? void 0 : 0,
      "aria-valuemax": e.indeterminate ? void 0 : 100
    }, [
      (n(), l("svg", So, [
        d[0] || (d[0] = u("circle", {
          class: "progress-ring-track",
          cx: "50",
          cy: "50",
          r: "42"
        }, null, -1)),
        e.indeterminate ? f("", !0) : (n(), l("circle", {
          key: 0,
          class: "progress-ring-fill",
          cx: "50",
          cy: "50",
          r: "42",
          style: D(i.value)
        }, null, 4)),
        e.indeterminate ? (n(), l("circle", xo)) : f("", !0)
      ]))
    ], 14, _o));
  }
}, ge = /* @__PURE__ */ B(Co, [["__scopeId", "data-v-5dfd8d0a"]]), Fo = ["src", "alt"], Vo = {
  key: 1,
  class: "image-placeholder"
}, Io = {
  key: 2,
  class: "image-error"
}, Bo = {
  __name: "FluentImage",
  props: {
    src: { type: String, required: !0 },
    alt: { type: String, default: "" },
    width: { type: [Number, String], default: "auto" },
    height: { type: [Number, String], default: "auto" },
    fit: { type: String, default: "contain" }
    // contain, cover, fill, none
  },
  setup(e) {
    const s = e, t = _(!0), a = _(!1), o = (d) => typeof d == "number" ? `${d}px` : d, i = x(() => ({
      width: o(s.width),
      height: o(s.height),
      objectFit: s.fit
    })), r = () => {
      t.value = !1, a.value = !1;
    }, c = () => {
      t.value = !1, a.value = !0;
    };
    return (d, m) => (n(), l("div", {
      class: w(["fluent-image", { "is-loading": t.value, "has-error": a.value }])
    }, [
      a.value ? f("", !0) : (n(), l("img", {
        key: 0,
        src: e.src,
        alt: e.alt,
        style: D(i.value),
        onLoad: r,
        onError: c
      }, null, 44, Fo)),
      t.value ? (n(), l("div", Vo, [
        F(ge, { size: 32 })
      ])) : f("", !0),
      a.value ? (n(), l("div", Io, [
        F(C, {
          icon: "image-20-regular",
          width: 24
        }),
        m[0] || (m[0] = u("span", null, "图片加载失败", -1))
      ])) : f("", !0)
    ], 2));
  }
}, Mo = /* @__PURE__ */ B(Bo, [["__scopeId", "data-v-adbf3c3d"]]), To = ["src", "alt"], Po = {
  key: 1,
  class: "image-loading"
}, Ro = {
  key: 2,
  class: "image-error"
}, No = {
  key: 3,
  class: "image-caption"
}, zo = {
  __name: "FluentImageViewer",
  props: {
    src: { type: String, required: !0 },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    width: { type: [Number, String], default: "auto" },
    height: { type: [Number, String], default: "auto" },
    fit: { type: String, default: "contain" },
    clickable: { type: Boolean, default: !1 }
  },
  emits: ["click", "load", "error"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!0), i = _(!1), r = (g) => typeof g == "number" ? `${g}px` : g, c = x(() => ({
      width: r(t.width),
      height: r(t.height),
      objectFit: t.fit,
      cursor: t.clickable ? "pointer" : "default"
    })), d = x(() => ({
      width: r(t.width)
    })), m = () => {
      o.value = !1, i.value = !1, a("load");
    }, b = () => {
      o.value = !1, i.value = !0, a("error");
    }, h = () => {
      t.clickable && a("click");
    };
    return (g, y) => (n(), l("div", {
      class: w(["fluent-image-viewer", { "is-loading": o.value, "has-error": i.value, clickable: e.clickable }]),
      style: D(d.value)
    }, [
      i.value ? f("", !0) : (n(), l("img", {
        key: 0,
        src: e.src,
        alt: e.alt,
        style: D(c.value),
        loading: "lazy",
        decoding: "async",
        onLoad: m,
        onError: b,
        onClick: h
      }, null, 44, To)),
      o.value ? (n(), l("div", Po, [
        F(ge, { size: 32 })
      ])) : f("", !0),
      i.value ? (n(), l("div", Ro, [
        F(C, {
          icon: "image-20-regular",
          width: 24
        }),
        y[0] || (y[0] = u("span", null, "图片加载失败", -1))
      ])) : f("", !0),
      e.caption ? (n(), l("div", No, k(e.caption), 1)) : f("", !0)
    ], 6));
  }
}, Ao = /* @__PURE__ */ B(zo, [["__scopeId", "data-v-44b08d97"]]), Eo = {
  key: 0,
  class: "badge-value"
}, Lo = {
  __name: "FluentInfoBadge",
  props: {
    value: { type: [Number, String], default: null },
    severity: { type: String, default: "attention" }
    // attention, success, caution, critical
  },
  setup(e) {
    const s = e, t = x(() => s.value !== null && s.value !== void 0 && s.value !== ""), a = x(() => typeof s.value == "number" && s.value > 999 ? "999+" : s.value);
    return (o, i) => (n(), l("div", {
      class: w(["fluent-info-badge", [`severity-${e.severity}`, { "has-value": t.value }]])
    }, [
      t.value ? (n(), l("span", Eo, k(a.value), 1)) : f("", !0)
    ], 2));
  }
}, Do = /* @__PURE__ */ B(Lo, [["__scopeId", "data-v-c218e17e"]]), Oo = { class: "info-bar-icon" }, Ko = { class: "info-bar-content" }, qo = {
  key: 0,
  class: "info-bar-title"
}, Ho = {
  key: 1,
  class: "info-bar-message"
}, jo = {
  key: 0,
  class: "info-bar-action"
}, Wo = {
  __name: "FluentInfoBar",
  props: {
    title: { type: String, default: "" },
    message: { type: String, default: "" },
    severity: { type: String, default: "info" },
    closable: { type: Boolean, default: !0 },
    action: { type: String, default: "" },
    modelValue: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "close", "action"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(t.modelValue);
    J(() => t.modelValue, (d) => {
      o.value = d;
    });
    const i = x(() => {
      switch (t.severity) {
        case "success":
          return "checkmark-circle-16-regular";
        case "warning":
          return "warning-16-regular";
        case "error":
          return "dismiss-circle-16-regular";
        default:
          return "info-16-regular";
      }
    }), r = () => {
      o.value = !1, a("update:modelValue", !1), a("close");
    }, c = () => {
      a("action");
    };
    return (d, m) => (n(), L(te, { name: "infobar" }, {
      default: Y(() => [
        o.value ? (n(), l("div", {
          key: 0,
          class: w(["fluent-info-bar", [`severity-${e.severity}`, { "is-closable": e.closable }]]),
          role: "alert"
        }, [
          u("div", Oo, [
            F(C, {
              icon: i.value,
              width: 16
            }, null, 8, ["icon"])
          ]),
          u("div", Ko, [
            e.title ? (n(), l("div", qo, k(e.title), 1)) : f("", !0),
            e.message ? (n(), l("div", Ho, k(e.message), 1)) : f("", !0),
            N(d.$slots, "default", {}, void 0, !0)
          ]),
          e.action ? (n(), l("div", jo, [
            F(be, {
              variant: "subtle",
              size: "sm",
              onClick: c
            }, {
              default: Y(() => [
                oe(k(e.action), 1)
              ]),
              _: 1
            })
          ])) : f("", !0),
          e.closable ? (n(), l("button", {
            key: 1,
            class: "info-bar-close",
            onClick: r
          }, [
            F(C, {
              icon: "dismiss-16-regular",
              width: 16
            })
          ])) : f("", !0)
        ], 2)) : f("", !0)
      ]),
      _: 3
    }));
  }
}, Go = /* @__PURE__ */ B(Wo, [["__scopeId", "data-v-3a724beb"]]), Uo = {
  key: 0,
  class: "input-label"
}, Yo = {
  key: 1,
  class: "input-prefix"
}, Xo = ["type", "value", "placeholder", "disabled", "readonly", "min", "max", "step"], Zo = {
  key: 2,
  class: "input-suffix"
}, Qo = {
  key: 3,
  class: "input-error"
}, Jo = {
  __name: "FluentInput",
  props: {
    modelValue: { type: [String, Number], default: "" },
    type: { type: String, default: "text" },
    placeholder: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    min: { type: [Number, String], default: void 0 },
    max: { type: [Number, String], default: void 0 },
    step: { type: [Number, String], default: void 0 },
    label: { type: String, default: "" },
    readonly: { type: Boolean, default: !1 },
    error: { type: String, default: "" }
  },
  emits: ["update:modelValue", "enter"],
  setup(e, { expose: s }) {
    const t = _(!1), a = _(null);
    function o() {
      var i;
      (i = a.value) == null || i.focus();
    }
    return s({ focus: o }), (i, r) => (n(), l("div", {
      class: w(["fluent-input-wrapper", { focused: t.value, disabled: e.disabled }])
    }, [
      e.label ? (n(), l("label", Uo, k(e.label), 1)) : f("", !0),
      i.$slots.prefix ? (n(), l("span", Yo, [
        N(i.$slots, "prefix", {}, void 0, !0)
      ])) : f("", !0),
      u("input", {
        ref_key: "inputRef",
        ref: a,
        type: e.type,
        value: e.modelValue,
        placeholder: e.placeholder,
        disabled: e.disabled,
        readonly: e.readonly,
        min: e.min,
        max: e.max,
        step: e.step,
        class: "fluent-input",
        onInput: r[0] || (r[0] = (c) => i.$emit("update:modelValue", c.target.value)),
        onFocus: r[1] || (r[1] = (c) => t.value = !0),
        onBlur: r[2] || (r[2] = (c) => t.value = !1),
        onKeydown: r[3] || (r[3] = ye((c) => i.$emit("enter"), ["enter"]))
      }, null, 40, Xo),
      i.$slots.suffix ? (n(), l("span", Zo, [
        N(i.$slots, "suffix", {}, void 0, !0)
      ])) : f("", !0),
      e.error ? (n(), l("span", Qo, k(e.error), 1)) : f("", !0)
    ], 2));
  }
}, Ze = /* @__PURE__ */ B(Jo, [["__scopeId", "data-v-b1a4cd36"]]), es = { class: "fluent-items-repeater" }, ts = {
  __name: "FluentItemsRepeater",
  props: {
    items: { type: Array, required: !0 },
    itemKey: { type: String, default: "id" }
  },
  setup(e) {
    const s = e, t = (a, o) => typeof a == "object" && a !== null && a[s.itemKey] || o;
    return (a, o) => (n(), l("div", es, [
      (n(!0), l(O, null, j(e.items, (i, r) => (n(), l("div", {
        key: t(i, r),
        class: "items-repeater-item"
      }, [
        N(a.$slots, "default", {
          item: i,
          index: r
        }, () => [
          u("span", null, k(i.label || i.title || String(i)), 1)
        ], !0)
      ]))), 128))
    ]));
  }
}, ns = /* @__PURE__ */ B(ts, [["__scopeId", "data-v-9ea8906d"]]), ls = ["aria-multiselectable"], as = ["data-index", "aria-selected", "onClick", "onDblclick", "onKeydown"], os = { class: "item-default" }, ss = { class: "item-label" }, is = {
  __name: "FluentItemsView",
  props: {
    items: { type: Array, required: !0 },
    layout: { type: String, default: "stack" },
    // stack, grid
    columns: { type: Number, default: 4 },
    selectionMode: { type: String, default: "none" },
    // none, single, multiple
    selectedItems: { type: Array, default: () => [] },
    itemInvokedEnabled: { type: Boolean, default: !1 },
    itemKey: { type: String, default: "id" }
  },
  emits: ["select", "invoke", "update:selectedItems"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = x(() => t.layout === "grid" ? {
      display: "grid",
      gridTemplateColumns: `repeat(${t.columns}, 1fr)`,
      gap: "12px"
    } : {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }), r = (h, g) => typeof h == "object" && h !== null && h[t.itemKey] || g, c = (h) => t.selectedItems.some((g) => typeof h == "object" && typeof g == "object" ? h[t.itemKey] === g[t.itemKey] : h === g), d = (h, g) => {
      if (t.selectionMode !== "none") {
        if (t.selectionMode === "single")
          a("update:selectedItems", [h]), a("select", { item: h, index: g, selected: [h] });
        else if (t.selectionMode === "multiple") {
          const y = [...t.selectedItems], v = y.findIndex((p) => typeof h == "object" && typeof p == "object" ? h[t.itemKey] === p[t.itemKey] : h === p);
          v > -1 ? y.splice(v, 1) : y.push(h), a("update:selectedItems", y), a("select", { item: h, index: g, selected: y });
        }
      }
    }, m = (h, g) => {
      t.itemInvokedEnabled && a("invoke", { item: h, index: g });
    }, b = (h, g) => {
      const y = [...t.selectedItems], v = y.findIndex((p) => typeof g == "object" && typeof p == "object" ? g[t.itemKey] === p[t.itemKey] : g === p);
      h && v === -1 ? y.push(g) : !h && v > -1 && y.splice(v, 1), a("update:selectedItems", y);
    };
    return (h, g) => (n(), l("div", {
      ref_key: "containerRef",
      ref: o,
      class: w(["fluent-items-view", { "is-selectable": e.selectionMode !== "none" }]),
      role: "listbox",
      "aria-multiselectable": e.selectionMode === "multiple"
    }, [
      u("div", {
        class: "items-view-layout",
        style: D(i.value)
      }, [
        (n(!0), l(O, null, j(e.items, (y, v) => (n(), l("div", {
          key: r(y, v),
          class: w(["items-view-item", {
            "is-selected": c(y),
            "is-invokable": e.itemInvokedEnabled
          }]),
          "data-index": v,
          "aria-selected": c(y),
          tabindex: 0,
          role: "option",
          onClick: (p) => d(y, v),
          onDblclick: (p) => m(y, v),
          onKeydown: [
            ye(ee((p) => m(y, v), ["prevent"]), ["enter"]),
            ye(ee((p) => d(y, v), ["prevent"]), ["space"])
          ]
        }, [
          e.selectionMode === "multiple" ? (n(), l("div", {
            key: 0,
            class: "item-checkbox",
            onClick: g[0] || (g[0] = ee(() => {
            }, ["stop"]))
          }, [
            F(pe, {
              "model-value": c(y),
              "onUpdate:modelValue": (p) => b(p, y)
            }, null, 8, ["model-value", "onUpdate:modelValue"])
          ])) : f("", !0),
          N(h.$slots, "default", {
            item: y,
            index: v
          }, () => [
            u("div", os, [
              u("span", ss, k(y.label || y.title || String(y)), 1)
            ])
          ], !0)
        ], 42, as))), 128))
      ], 4)
    ], 10, ls));
  }
}, rs = /* @__PURE__ */ B(is, [["__scopeId", "data-v-1de12b38"]]), us = { class: "list-box-items" }, cs = ["onClick"], ds = { class: "list-box-item-label" }, fs = {
  __name: "FluentListBox",
  props: {
    items: { type: Array, required: !0 },
    modelValue: { type: [Object, String, Number, Boolean, Array], default: null },
    selectedIndex: { type: Number, default: -1 },
    multiple: { type: Boolean, default: !1 },
    labelKey: { type: String, default: "label" },
    valueKey: { type: String, default: "value" }
  },
  emits: ["update:modelValue", "update:selectedIndex", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = (d, m) => t.multiple && Array.isArray(t.modelValue) ? t.modelValue.some((b) => i(b, d)) : t.selectedIndex === m || i(t.modelValue, d), i = (d, m) => typeof d == "object" && d !== null && typeof m == "object" && m !== null ? d[t.valueKey] === m[t.valueKey] : d === m, r = (d) => typeof d == "object" && d !== null && (d[t.labelKey] || d[t.valueKey]) || String(d), c = (d, m) => {
      if (t.multiple) {
        const b = Array.isArray(t.modelValue) ? [...t.modelValue] : [], h = b.findIndex((g) => i(g, d));
        h > -1 ? b.splice(h, 1) : b.push(d), a("update:modelValue", b), a("change", b);
      } else
        a("update:modelValue", d), a("update:selectedIndex", m), a("change", { item: d, index: m });
    };
    return (d, m) => (n(), l("div", {
      class: w(["fluent-list-box", { "is-multiple": e.multiple }])
    }, [
      u("div", us, [
        (n(!0), l(O, null, j(e.items, (b, h) => (n(), l("div", {
          key: h,
          class: w(["list-box-item", { "is-selected": o(b, h) }]),
          onClick: (g) => c(b, h)
        }, [
          N(d.$slots, "item", {
            item: b,
            index: h
          }, () => [
            u("span", ds, k(r(b)), 1)
          ], !0)
        ], 10, cs))), 128))
      ])
    ], 2));
  }
}, ms = /* @__PURE__ */ B(fs, [["__scopeId", "data-v-98463a93"]]), vs = { class: "glass-content" }, ps = {
  __name: "FluentLiquidGlass",
  props: {
    variant: { type: String, default: "light" },
    // light, dark, colored, accent
    blur: { type: Number, default: 20 },
    opacity: { type: Number, default: 0.7 },
    animated: { type: Boolean, default: !0 },
    accentColor: { type: String, default: "#0078d4" }
  },
  setup(e) {
    const s = e, t = x(() => ({
      "--glass-blur": `${s.blur}px`,
      "--glass-opacity": s.opacity,
      "--accent-color": s.accentColor,
      "--accent-color-rgb": a(s.accentColor)
    }));
    function a(o) {
      const i = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(o);
      return i ? `${parseInt(i[1], 16)}, ${parseInt(i[2], 16)}, ${parseInt(i[3], 16)}` : "0, 120, 212";
    }
    return (o, i) => (n(), l("div", {
      class: w(["fluent-liquid-glass", [`variant-${e.variant}`, { "is-animated": e.animated }]]),
      style: D(t.value)
    }, [
      i[0] || (i[0] = u("div", { class: "glass-layer glass-refraction" }, null, -1)),
      i[1] || (i[1] = u("div", { class: "glass-layer glass-tint" }, null, -1)),
      i[2] || (i[2] = u("div", { class: "glass-layer glass-highlight" }, null, -1)),
      u("div", vs, [
        N(o.$slots, "default", {}, void 0, !0)
      ])
    ], 6));
  }
}, hs = /* @__PURE__ */ B(ps, [["__scopeId", "data-v-7d7d98c0"]]), ys = {
  key: 0,
  class: "list-view-header"
}, bs = { class: "header-text" }, gs = { class: "list-view-items" }, ks = { class: "group-header-text" }, $s = ["onClick"], ws = {
  key: 0,
  class: "item-selection"
}, _s = {
  key: 0,
  class: "item-checkbox"
}, Ss = { class: "item-content" }, xs = { class: "item-text" }, Cs = { class: "item-label" }, Fs = {
  key: 0,
  class: "item-description"
}, Vs = ["onClick", "onDblclick"], Is = {
  key: 0,
  class: "item-selection"
}, Bs = {
  key: 0,
  class: "item-checkbox"
}, Ms = { class: "item-content" }, Ts = { class: "item-text" }, Ps = { class: "item-label" }, Rs = {
  key: 0,
  class: "item-description"
}, Ns = {
  __name: "FluentListView",
  props: {
    items: { type: Array, required: !0 },
    header: { type: String, default: "" },
    selectionMode: { type: String, default: "none" },
    // none, single, multiple
    selectedItems: { type: Array, default: () => [] },
    isGrouped: { type: Boolean, default: !1 },
    showGroupHeaders: { type: Boolean, default: !0 },
    stickyHeaders: { type: Boolean, default: !1 },
    itemKey: { type: String, default: "id" }
  },
  emits: ["select", "invoke", "update:selectedItems"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = (b, h) => typeof b == "object" && b !== null && b[t.itemKey] || h, r = (b) => t.selectedItems.some((h) => typeof b == "object" && typeof h == "object" ? b[t.itemKey] === h[t.itemKey] : b === h), c = (b, h) => {
      if (t.selectionMode !== "none") {
        if (t.selectionMode === "single")
          a("update:selectedItems", [b]), a("select", { item: b, index: h, selected: [b] });
        else if (t.selectionMode === "multiple") {
          const g = [...t.selectedItems], y = g.findIndex((v) => typeof b == "object" && typeof v == "object" ? b[t.itemKey] === v[t.itemKey] : b === v);
          y > -1 ? g.splice(y, 1) : g.push(b), a("update:selectedItems", g), a("select", { item: b, index: h, selected: g });
        }
      }
    }, d = (b, h) => {
      a("invoke", { item: b, index: h });
    }, m = (b, h) => {
      const g = [...t.selectedItems], y = g.findIndex((v) => typeof h == "object" && typeof v == "object" ? h[t.itemKey] === v[t.itemKey] : h === v);
      b && y === -1 ? g.push(h) : !b && y > -1 && g.splice(y, 1), a("update:selectedItems", g);
    };
    return (b, h) => (n(), l("div", {
      ref_key: "containerRef",
      ref: o,
      class: w(["fluent-list-view", {
        "is-selectable": e.selectionMode !== "none",
        "is-grouped": e.isGrouped
      }])
    }, [
      e.header ? (n(), l("div", ys, [
        N(b.$slots, "header", {}, () => [
          u("span", bs, k(e.header), 1)
        ], !0)
      ])) : f("", !0),
      u("div", gs, [
        e.isGrouped ? (n(!0), l(O, { key: 0 }, j(e.items, (g, y) => (n(), l("div", {
          key: y,
          class: "list-group"
        }, [
          e.showGroupHeaders ? (n(), l("div", {
            key: 0,
            class: w(["group-header", { "is-sticky": e.stickyHeaders }])
          }, [
            N(b.$slots, "group-header", { group: g }, () => [
              u("span", ks, k(g.key || g.label), 1)
            ], !0)
          ], 2)) : f("", !0),
          (n(!0), l(O, null, j(g.items, (v, p) => (n(), l("div", {
            key: i(v, p),
            class: w(["list-view-item", { "is-selected": r(v) }]),
            onClick: ($) => c(v, p)
          }, [
            e.selectionMode !== "none" ? (n(), l("div", ws, [
              e.selectionMode === "multiple" ? (n(), l("div", _s, [
                F(pe, {
                  "model-value": r(v),
                  "onUpdate:modelValue": ($) => m($, v)
                }, null, 8, ["model-value", "onUpdate:modelValue"])
              ])) : (n(), l("div", {
                key: 1,
                class: w(["item-radio", { "is-selected": r(v) }])
              }, null, 2))
            ])) : f("", !0),
            N(b.$slots, "default", {
              item: v,
              index: p
            }, () => [
              u("div", Ss, [
                v.icon ? (n(), L(C, {
                  key: 0,
                  icon: v.icon,
                  width: 20
                }, null, 8, ["icon"])) : f("", !0),
                u("div", xs, [
                  u("span", Cs, k(v.label || v.title), 1),
                  v.description ? (n(), l("span", Fs, k(v.description), 1)) : f("", !0)
                ])
              ])
            ], !0)
          ], 10, $s))), 128))
        ]))), 128)) : (n(!0), l(O, { key: 1 }, j(e.items, (g, y) => (n(), l("div", {
          key: i(g, y),
          class: w(["list-view-item", { "is-selected": r(g) }]),
          onClick: (v) => c(g, y),
          onDblclick: (v) => d(g, y)
        }, [
          e.selectionMode !== "none" ? (n(), l("div", Is, [
            e.selectionMode === "multiple" ? (n(), l("div", Bs, [
              F(pe, {
                "model-value": r(g),
                "onUpdate:modelValue": (v) => m(v, g)
              }, null, 8, ["model-value", "onUpdate:modelValue"])
            ])) : (n(), l("div", {
              key: 1,
              class: w(["item-radio", { "is-selected": r(g) }])
            }, null, 2))
          ])) : f("", !0),
          N(b.$slots, "default", {
            item: g,
            index: y
          }, () => [
            u("div", Ms, [
              g.icon ? (n(), L(C, {
                key: 0,
                icon: g.icon,
                width: 20
              }, null, 8, ["icon"])) : f("", !0),
              u("div", Ts, [
                u("span", Ps, k(g.label || g.title), 1),
                g.description ? (n(), l("span", Rs, k(g.description), 1)) : f("", !0)
              ])
            ])
          ], !0)
        ], 42, Vs))), 128))
      ])
    ], 2));
  }
}, zs = /* @__PURE__ */ B(Ns, [["__scopeId", "data-v-b033b8d3"]]), As = {
  key: 0,
  class: "pip-placeholder"
}, Es = ["src"], Ls = { class: "pip-placeholder-label" }, Ds = { class: "audio-artwork" }, Os = ["src"], Ks = { class: "audio-meta" }, qs = {
  key: 0,
  class: "play-button"
}, Hs = ["aria-valuenow", "aria-valuemax"], js = { class: "progress-track" }, Ws = { class: "controls-bar" }, Gs = ["aria-label"], Us = { class: "controls-time" }, Ys = { class: "controls-right" }, Xs = ["aria-pressed"], Zs = {
  key: 1,
  class: "control-menu"
}, Qs = {
  key: 0,
  class: "control-popover rate-options"
}, Js = ["onClick"], ei = ["aria-pressed"], ti = ["aria-label", "aria-expanded"], ni = {
  key: 0,
  id: "media-volume-popover",
  class: "control-popover volume-popover"
}, li = ["value"], ai = {
  __name: "FluentMediaPlayer",
  props: {
    src: { type: String, required: !0 },
    poster: { type: String, default: "" },
    title: { type: String, default: "" },
    artist: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    type: { type: String, default: "auto" },
    fit: { type: String, default: "contain" },
    width: { type: [String, Number], default: "100%" },
    height: { type: [String, Number], default: "auto" },
    maxWidth: { type: [String, Number], default: "100%" },
    maxHeight: { type: [String, Number], default: "75vh" },
    disableAnimations: { type: Boolean, default: !1 },
    autoplay: { type: Boolean, default: !1 },
    loop: { type: Boolean, default: !1 },
    muted: { type: Boolean, default: !1 },
    volume: { type: Number, default: 1 },
    playbackRate: { type: Number, default: 1 },
    showLoop: { type: Boolean, default: !0 },
    showPlaybackRate: { type: Boolean, default: !0 },
    showPictureInPicture: { type: Boolean, default: !0 },
    showMinimize: { type: Boolean, default: !1 }
  },
  emits: ["play", "pause", "ended", "timeupdate", "loadedmetadata", "volumechange", "ratechange", "autoplayblocked", "minimize"],
  setup(e, { expose: s, emit: t }) {
    const a = e, o = t, i = _(null), r = _(null), c = _(null), d = _(null), m = _(!1), b = _(!0), h = _(0), g = _(0), y = _(0), v = _(!1), p = _(!1), $ = _(!0), I = _(a.muted), S = _(Math.max(0, Math.min(1, a.volume))), M = _(a.loop), P = _(a.playbackRate), R = _(!1), z = _(!1), K = _(!a.disableAnimations), E = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let U = null, G = null, H = null, X = null, ne = null, le = null, ue = S.value > 0 ? S.value : 0.5;
    const de = x(() => a.type !== "auto" ? a.type === "audio" : /\.(mp3|wav|ogg|m4a|aac|flac)(?:[?#].*)?$/i.test(a.src)), ke = x(() => {
      const V = a.src.split(/[?#]/)[0].split("/").pop() || "音频";
      try {
        return decodeURIComponent(V);
      } catch {
        return V;
      }
    }), $e = x(() => typeof document < "u" && !!document.pictureInPictureEnabled), me = (V) => typeof V == "number" ? `${V}px` : V, Ve = x(() => ({ width: me(a.width), height: me(a.height), maxWidth: me(a.maxWidth) })), Be = x(() => ({ objectFit: a.fit, height: a.height === "auto" ? "auto" : "100%", maxHeight: me(a.maxHeight) })), we = x(() => ({ transform: `scaleX(${g.value ? Math.max(0, Math.min(1, h.value / g.value)) : 0})` })), Me = x(() => ({ width: `${y.value}%` })), _e = x(() => I.value || S.value === 0 ? "speaker-mute-20-regular" : S.value < 0.5 ? "speaker-1-20-regular" : "speaker-2-20-regular");
    function T() {
      const V = c.value;
      V && (V.paused ? A() : q());
    }
    async function A() {
      if (!c.value) return !1;
      try {
        return await c.value.play(), !0;
      } catch (V) {
        return o("autoplayblocked", V), !1;
      }
    }
    function q() {
      var V;
      (V = c.value) == null || V.pause();
    }
    function Z(V) {
      const W = c.value;
      if (!W || !Number.isFinite(V)) return;
      const se = Number.isFinite(W.duration) ? W.duration : V;
      W.currentTime = Math.max(0, Math.min(se, V)), h.value = W.currentTime;
    }
    function Q() {
      K.value = !1;
    }
    function ae() {
      K.value = !0;
    }
    function ie() {
      const V = c.value;
      if (!V) return;
      const W = {
        src: a.src,
        poster: a.poster,
        title: a.title,
        artist: a.artist,
        subtitle: a.subtitle,
        type: de.value ? "audio" : "video",
        currentTime: V.currentTime,
        playing: !V.paused && !V.ended,
        volume: V.volume,
        muted: V.muted,
        playbackRate: V.playbackRate,
        loop: V.loop
      };
      q(), o("minimize", W);
    }
    s({
      el: r,
      contentEl: i,
      play: A,
      pause: q,
      seek: Z,
      minimize: ie,
      pauseInternalAnimation: Q,
      resumeInternalAnimation: ae
    });
    function Se() {
      const V = c.value;
      V && (I.value && S.value === 0 && (S.value = ue, V.volume = S.value), I.value = !I.value, V.muted = I.value, o("volumechange", { volume: S.value, muted: I.value }));
    }
    function xe(V) {
      const W = c.value;
      W && (S.value = Number(V.target.value), S.value > 0 && (ue = S.value), I.value = S.value === 0, W.volume = S.value, W.muted = I.value, o("volumechange", { volume: S.value, muted: I.value }));
    }
    function Ie() {
      M.value = !M.value, c.value && (c.value.loop = M.value);
    }
    function Je(V) {
      P.value = Number(V), c.value && (c.value.playbackRate = P.value), R.value = !1, o("ratechange", P.value);
    }
    function et() {
      R.value = !R.value, z.value = !1;
    }
    function tt() {
      le && clearTimeout(le), z.value = !z.value, R.value = !1;
    }
    function Le() {
      le && clearTimeout(le), z.value = !0, R.value = !1;
    }
    function nt() {
      window.matchMedia("(hover: hover) and (pointer: fine)").matches && Le();
    }
    function De() {
      le && clearTimeout(le), le = setTimeout(() => {
        z.value = !1;
      }, 220);
    }
    async function lt() {
      const V = c.value;
      if (!(!V || de.value || !$e.value))
        try {
          document.pictureInPictureElement ? await document.exitPictureInPicture() : await V.requestPictureInPicture();
        } catch {
        }
    }
    async function Oe() {
      if (!(!i.value || de.value))
        try {
          document.fullscreenElement ? await document.exitFullscreen() : await i.value.requestFullscreen();
        } catch {
        }
    }
    function at() {
      H = null;
      const V = c.value;
      if (!V || !g.value || !ne) return;
      const { clientX: W, target: se } = ne, he = se.getBoundingClientRect(), pt = Math.max(0, Math.min(1, (W - he.left) / he.width));
      V.currentTime = pt * g.value, h.value = V.currentTime;
    }
    function Te(V) {
      ne = { clientX: V.clientX, target: V.currentTarget }, H || (H = requestAnimationFrame(at));
    }
    function ot(V) {
      V.pointerType === "mouse" && V.button !== 0 || (X = V.pointerId, V.currentTarget.setPointerCapture(V.pointerId), Te(V));
    }
    function st(V) {
      V.pointerId === X && Te(V);
    }
    function Pe(V) {
      V.pointerId === X && (Te(V), V.currentTarget.hasPointerCapture(V.pointerId) && V.currentTarget.releasePointerCapture(V.pointerId), X = null);
    }
    function it(V) {
      const W = c.value;
      if (!W || !g.value) return;
      const se = V.shiftKey ? 1 : 5, he = V.key === "Home" ? 0 : V.key === "End" ? g.value : V.key === "ArrowLeft" ? W.currentTime - se : V.key === "ArrowRight" ? W.currentTime + se : null;
      he != null && (V.preventDefault(), W.currentTime = Math.max(0, Math.min(g.value, he)), h.value = W.currentTime);
    }
    function Ke() {
      if (!c.value || c.value.paused || c.value.ended) {
        G = null;
        return;
      }
      X == null && (h.value = c.value.currentTime), G = requestAnimationFrame(Ke);
    }
    function rt() {
      G && cancelAnimationFrame(G), G = requestAnimationFrame(Ke);
    }
    function Re() {
      G && cancelAnimationFrame(G), G = null;
    }
    function qe(V) {
      if (!Number.isFinite(V)) return "0:00";
      const W = Math.floor(V / 60), se = Math.floor(V % 60);
      return `${W}:${se.toString().padStart(2, "0")}`;
    }
    function Ne() {
      $.value = !0, U && clearTimeout(U), U = setTimeout(() => {
        m.value && !de.value && ($.value = !1);
      }, 3e3);
    }
    function ut() {
      m.value = !0, rt(), Ne(), o("play");
    }
    function ct() {
      m.value = !1, Re(), $.value = !0, o("pause");
    }
    function dt() {
      m.value = !1, Re(), o("ended");
    }
    function ft() {
      c.value && (h.value = c.value.currentTime, o("timeupdate", h.value));
    }
    function mt() {
      const V = c.value;
      V && (g.value = Number.isFinite(V.duration) ? V.duration : 0, V.volume = S.value, V.muted = I.value, V.playbackRate = P.value, V.loop = M.value, b.value = !1, o("loadedmetadata", { duration: g.value }));
    }
    function vt() {
      const V = c.value;
      !V || !V.buffered.length || !g.value || (y.value = V.buffered.end(V.buffered.length - 1) / g.value * 100);
    }
    function He() {
      v.value = document.fullscreenElement === i.value;
    }
    function je(V) {
      var W;
      (W = d.value) != null && W.contains(V.target) || (z.value = !1);
    }
    function We(V) {
      V.key === "Escape" && (z.value = !1, R.value = !1);
    }
    return J(() => a.loop, (V) => {
      M.value = V;
    }), J(() => a.muted, (V) => {
      I.value = V, c.value && (c.value.muted = V);
    }), J(() => a.volume, (V) => {
      S.value = Math.max(0, Math.min(1, V)), S.value > 0 && (ue = S.value), c.value && (c.value.volume = S.value);
    }), J(() => a.playbackRate, (V) => {
      P.value = V, c.value && (c.value.playbackRate = V);
    }), J(() => a.autoplay, (V) => {
      var W;
      V && ((W = c.value) == null || W.play().catch((se) => o("autoplayblocked", se)));
    }), J(() => a.disableAnimations, (V) => {
      K.value = !V;
    }), J(() => a.src, async () => {
      var V;
      h.value = 0, g.value = 0, y.value = 0, b.value = !0, await ve(), (V = c.value) == null || V.load();
    }), re(() => {
      document.addEventListener("fullscreenchange", He), document.addEventListener("pointerdown", je), document.addEventListener("keydown", We);
    }), ce(() => {
      var V;
      (V = c.value) == null || V.pause(), U && clearTimeout(U), le && clearTimeout(le), Re(), H && cancelAnimationFrame(H), document.removeEventListener("fullscreenchange", He), document.removeEventListener("pointerdown", je), document.removeEventListener("keydown", We);
    }), (V, W) => (n(), l("div", {
      ref_key: "rootRef",
      ref: r,
      class: w(["fluent-media-player", { "is-audio": de.value, "is-fullscreen": v.value, "animations-disabled": !K.value }]),
      style: D(Ve.value),
      onPointermove: Ne,
      onPointerdown: Ne
    }, [
      u("div", {
        ref_key: "containerRef",
        ref: i,
        class: "media-container"
      }, [
        (n(), L(bt(de.value ? "audio" : "video"), {
          ref_key: "mediaRef",
          ref: c,
          class: "media-element",
          style: D(Be.value),
          src: e.src,
          poster: de.value ? void 0 : e.poster,
          autoplay: e.autoplay,
          loop: M.value,
          muted: I.value,
          preload: "metadata",
          playsinline: "",
          onPlay: ut,
          onPause: ct,
          onEnded: dt,
          onTimeupdate: ft,
          onLoadedmetadata: mt,
          onProgress: vt,
          onWaiting: W[0] || (W[0] = (se) => b.value = !0),
          onCanplay: W[1] || (W[1] = (se) => b.value = !1),
          onEnterpictureinpicture: W[2] || (W[2] = (se) => p.value = !0),
          onLeavepictureinpicture: W[3] || (W[3] = (se) => p.value = !1)
        }, null, 40, ["style", "src", "poster", "autoplay", "loop", "muted"])),
        p.value ? (n(), l("div", As, [
          e.poster ? (n(), l("img", {
            key: 0,
            src: e.poster,
            alt: ""
          }, null, 8, Es)) : f("", !0),
          u("div", Ls, [
            F(C, {
              icon: "picture-in-picture-20-regular",
              width: 22
            }),
            W[6] || (W[6] = u("span", null, "正在画中画播放", -1))
          ])
        ])) : f("", !0),
        de.value ? (n(), l("div", {
          key: 1,
          class: "audio-stage",
          onClick: T
        }, [
          u("div", Ds, [
            e.poster ? (n(), l("img", {
              key: 0,
              src: e.poster,
              alt: ""
            }, null, 8, Os)) : (n(), L(C, {
              key: 1,
              icon: "music-note-2-24-filled",
              width: 42
            }))
          ]),
          u("div", Ks, [
            u("strong", null, k(e.title || ke.value), 1),
            u("span", null, k(e.artist || e.subtitle || (m.value ? "正在播放" : "音频")), 1)
          ]),
          b.value ? (n(), L(ge, {
            key: 0,
            size: 30
          })) : f("", !0)
        ])) : (n(), l("button", {
          key: 2,
          type: "button",
          class: "media-overlay",
          "aria-label": "播放或暂停",
          onClick: T,
          onDblclick: Oe
        }, [
          !m.value && !b.value ? (n(), l("span", qs, [
            F(C, {
              icon: "play-24-filled",
              width: 32
            })
          ])) : f("", !0),
          b.value ? (n(), L(ge, {
            key: 1,
            size: 48
          })) : f("", !0)
        ], 32)),
        u("div", {
          class: w(["media-controls", { "is-visible": $.value || de.value }]),
          onClick: W[4] || (W[4] = ee(() => {
          }, ["stop"])),
          onPointerdown: W[5] || (W[5] = ee(() => {
          }, ["stop"]))
        }, [
          u("div", {
            class: "controls-progress",
            role: "slider",
            "aria-label": "播放进度",
            "aria-valuemin": "0",
            "aria-valuenow": h.value,
            "aria-valuemax": g.value,
            tabindex: "0",
            onPointerdown: ot,
            onPointermove: st,
            onPointerup: Pe,
            onPointercancel: Pe,
            onLostpointercapture: Pe,
            onKeydown: it
          }, [
            u("div", js, [
              u("div", {
                class: "progress-buffer",
                style: D(Me.value)
              }, null, 4),
              u("div", {
                class: "progress-fill",
                style: D(we.value)
              }, null, 4)
            ])
          ], 40, Hs),
          u("div", Ws, [
            u("button", {
              type: "button",
              class: "control-button",
              "aria-label": m.value ? "暂停" : "播放",
              onClick: T
            }, [
              F(C, {
                icon: m.value ? "pause-20-filled" : "play-20-filled",
                width: 20
              }, null, 8, ["icon"])
            ], 8, Gs),
            u("div", Us, [
              u("span", null, k(qe(h.value)), 1),
              W[7] || (W[7] = u("span", { class: "time-separator" }, "/", -1)),
              u("span", null, k(qe(g.value)), 1)
            ]),
            u("div", Ys, [
              e.showLoop ? (n(), l("button", {
                key: 0,
                type: "button",
                class: w(["control-button", { active: M.value }]),
                "aria-pressed": M.value,
                "aria-label": "循环播放",
                title: "循环播放",
                onClick: Ie
              }, [
                F(C, {
                  icon: "arrow-repeat-all-20-regular",
                  width: 20
                })
              ], 10, Xs)) : f("", !0),
              e.showPlaybackRate ? (n(), l("div", Zs, [
                u("button", {
                  type: "button",
                  class: "control-button rate-button",
                  "aria-label": "播放速度",
                  onClick: et
                }, [
                  u("span", null, k(P.value) + "x", 1)
                ]),
                R.value ? (n(), l("div", Qs, [
                  (n(), l(O, null, j(E, (se) => u("button", {
                    key: se,
                    type: "button",
                    class: w({ active: se === P.value }),
                    onClick: (he) => Je(se)
                  }, k(se) + "x", 11, Js)), 64))
                ])) : f("", !0)
              ])) : f("", !0),
              !de.value && e.showPictureInPicture && $e.value ? (n(), l("button", {
                key: 2,
                type: "button",
                class: w(["control-button", { active: p.value }]),
                "aria-pressed": p.value,
                "aria-label": "画中画",
                title: "画中画",
                onClick: lt
              }, [
                F(C, {
                  icon: "picture-in-picture-20-regular",
                  width: 20
                })
              ], 10, ei)) : f("", !0),
              e.showMinimize ? (n(), l("button", {
                key: 3,
                type: "button",
                class: "control-button",
                "aria-label": "在迷你播放器中继续",
                title: "在迷你播放器中继续",
                onClick: ie
              }, [
                F(C, {
                  icon: "arrow-minimize-20-regular",
                  width: 20
                })
              ])) : f("", !0),
              u("div", {
                ref_key: "volumeControlRef",
                ref: d,
                class: "control-menu volume-control",
                onPointerenter: nt,
                onPointerleave: De,
                onFocusin: Le,
                onFocusout: De
              }, [
                u("button", {
                  type: "button",
                  class: "control-button",
                  "aria-label": I.value ? "取消静音" : "音量",
                  "aria-expanded": z.value,
                  "aria-controls": "media-volume-popover",
                  onClick: tt
                }, [
                  F(C, {
                    icon: _e.value,
                    width: 20
                  }, null, 8, ["icon"])
                ], 8, ti),
                z.value ? (n(), l("div", ni, [
                  u("button", {
                    type: "button",
                    class: "popover-mute",
                    onClick: Se
                  }, [
                    F(C, {
                      icon: _e.value,
                      width: 18
                    }, null, 8, ["icon"])
                  ]),
                  u("input", {
                    class: "volume-slider",
                    type: "range",
                    min: "0",
                    max: "1",
                    step: "0.01",
                    value: I.value ? 0 : S.value,
                    "aria-label": "音量",
                    onInput: xe
                  }, null, 40, li)
                ])) : f("", !0)
              ], 544),
              de.value ? f("", !0) : (n(), l("button", {
                key: 4,
                type: "button",
                class: "control-button",
                "aria-label": "全屏",
                onClick: Oe
              }, [
                F(C, {
                  icon: v.value ? "full-screen-minimize-20-regular" : "full-screen-maximize-20-regular",
                  width: 20
                }, null, 8, ["icon"])
              ]))
            ])
          ])
        ], 34)
      ], 512)
    ], 38));
  }
}, Qe = /* @__PURE__ */ B(ai, [["__scopeId", "data-v-8c002b86"]]), oi = /* @__PURE__ */ Object.assign({ inheritAttrs: !1 }, {
  __name: "FluentMediaPlayerElement",
  props: {
    src: { type: String, required: !0 },
    poster: { type: String, default: "" },
    autoplay: { type: Boolean, default: !1 },
    loop: { type: Boolean, default: !1 },
    muted: { type: Boolean, default: !1 }
  },
  setup(e) {
    return (s, t) => (n(), L(Qe, gt(s.$attrs, {
      src: e.src,
      poster: e.poster,
      autoplay: e.autoplay,
      loop: e.loop,
      muted: e.muted
    }), null, 16, ["src", "poster", "autoplay", "loop", "muted"]));
  }
}), si = {
  class: "fluent-menu-bar",
  role: "menubar"
}, ii = ["aria-haspopup", "aria-expanded", "disabled", "onClick", "onMouseenter"], ri = { class: "menu-bar-label" }, ui = {
  key: 0,
  class: "menu-bar-dropdown"
}, ci = {
  key: 0,
  class: "menu-separator"
}, di = ["disabled", "onClick"], fi = { class: "menu-item-label" }, mi = {
  key: 1,
  class: "menu-item-shortcut"
}, vi = {
  __name: "FluentMenuBar",
  props: {
    items: { type: Array, required: !0 }
  },
  emits: ["item-click"],
  setup(e, { emit: s }) {
    const t = s, a = _(null), o = (m) => {
      a.value === m ? a.value = null : a.value = m;
    }, i = (m) => {
      a.value !== null && (a.value = m);
    }, r = (m) => {
      m.disabled || (a.value = null, t("item-click", m));
    }, c = () => {
      a.value = null;
    }, d = (m) => {
      m.target.closest(".fluent-menu-bar") || c();
    };
    return re(() => {
      document.addEventListener("click", d);
    }), ce(() => {
      document.removeEventListener("click", d);
    }), (m, b) => (n(), l("nav", si, [
      (n(!0), l(O, null, j(e.items, (h, g) => (n(), l("div", {
        key: g,
        class: w(["menu-bar-item", { "is-open": a.value === g, "is-disabled": h.disabled }])
      }, [
        u("button", {
          class: "menu-bar-button",
          type: "button",
          role: "menuitem",
          "aria-haspopup": h.children && h.children.length > 0,
          "aria-expanded": a.value === g,
          disabled: h.disabled,
          onClick: (y) => o(g),
          onMouseenter: (y) => i(g)
        }, [
          h.icon ? (n(), L(C, {
            key: 0,
            icon: h.icon,
            width: 16
          }, null, 8, ["icon"])) : f("", !0),
          u("span", ri, k(h.label), 1)
        ], 40, ii),
        F(te, { name: "dropdown" }, {
          default: Y(() => [
            a.value === g && h.children && h.children.length > 0 ? (n(), l("div", ui, [
              (n(!0), l(O, null, j(h.children, (y, v) => (n(), l(O, { key: v }, [
                y.type === "separator" ? (n(), l("div", ci)) : (n(), l("button", {
                  key: 1,
                  class: w(["menu-item", { "is-disabled": y.disabled }]),
                  disabled: y.disabled,
                  onClick: (p) => r(y)
                }, [
                  y.icon ? (n(), L(C, {
                    key: 0,
                    icon: y.icon,
                    width: 16
                  }, null, 8, ["icon"])) : f("", !0),
                  u("span", fi, k(y.label), 1),
                  y.shortcut ? (n(), l("span", mi, k(y.shortcut), 1)) : f("", !0)
                ], 10, di))
              ], 64))), 128))
            ])) : f("", !0)
          ]),
          _: 2
        }, 1024)
      ], 2))), 128))
    ]));
  }
}, pi = /* @__PURE__ */ B(vi, [["__scopeId", "data-v-937627d3"]]), hi = { class: "modal-header" }, yi = { class: "modal-title" }, bi = { class: "modal-body" }, gi = {
  key: 0,
  class: "modal-footer"
}, ki = {
  __name: "FluentModal",
  props: {
    modelValue: { type: Boolean, default: !1 },
    title: { type: String, default: "" },
    maxWidth: { type: String, default: "520px" },
    persistent: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s;
    function o() {
      a("update:modelValue", !1), a("close");
    }
    function i() {
      t.persistent || o();
    }
    return (r, c) => (n(), L(fe, { to: "body" }, [
      F(te, { name: "modal" }, {
        default: Y(() => [
          e.modelValue ? (n(), l("div", {
            key: 0,
            class: "fluent-modal-overlay",
            onClick: ee(i, ["self"])
          }, [
            u("div", {
              class: "fluent-modal",
              style: D({ maxWidth: e.maxWidth })
            }, [
              u("div", hi, [
                u("h2", yi, [
                  N(r.$slots, "icon", {}, void 0, !0),
                  oe(" " + k(e.title), 1)
                ]),
                u("button", {
                  class: "modal-close",
                  onClick: o
                }, [
                  F(C, {
                    icon: "dismiss-16-regular",
                    width: 16
                  })
                ])
              ]),
              u("div", bi, [
                N(r.$slots, "default", {}, void 0, !0)
              ]),
              r.$slots.footer ? (n(), l("div", gi, [
                N(r.$slots, "footer", {}, void 0, !0)
              ])) : f("", !0)
            ], 4)
          ])) : f("", !0)
        ]),
        _: 3
      })
    ]));
  }
}, $i = /* @__PURE__ */ B(ki, [["__scopeId", "data-v-54b182ff"]]), wi = { class: "navigation-view-pane" }, _i = { class: "pane-header" }, Si = {
  key: 1,
  class: "pane-title"
}, xi = { class: "pane-content" }, Ci = {
  key: 0,
  class: "pane-search"
}, Fi = { class: "pane-menu" }, Vi = {
  key: 0,
  class: "menu-separator"
}, Ii = {
  key: 1,
  class: "menu-header"
}, Bi = {
  key: 2,
  class: "menu-item-wrapper"
}, Mi = ["aria-expanded", "disabled", "onClick"], Ti = { class: "menu-item-label" }, Pi = { class: "menu-item-label" }, Ri = {
  key: 1,
  class: "menu-item-badge"
}, Ni = {
  key: 2,
  class: "menu-children"
}, zi = { class: "menu-item-label" }, Ai = { class: "pane-footer" }, Ei = { class: "navigation-view-content" }, Li = {
  __name: "FluentNavigationView",
  props: {
    menuItems: { type: Array, required: !0 },
    paneTitle: { type: String, default: "" },
    showToggleButton: { type: Boolean, default: !0 },
    showSearchBox: { type: Boolean, default: !1 },
    defaultSelectedItem: { type: String, default: "" },
    compactMode: { type: Boolean, default: !1 }
  },
  emits: ["item-selected", "pane-toggle"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = Ye(), i = _(!t.compactMode), r = _(t.compactMode), c = _(t.defaultSelectedItem), d = _([]), m = (y) => {
      for (const v of t.menuItems) {
        if (v.to === y) return v;
        if (v.children) {
          for (const p of v.children)
            if (p.to === y) return { ...p, parent: v.id };
        }
      }
      return null;
    };
    J(() => o.path, (y) => {
      const v = m(y);
      v && (c.value = v.id, v.parent && (d.value = [...d.value, v.parent]));
    }, { immediate: !0 });
    const b = (y) => {
      y.disabled || (c.value = y.id, a("item-selected", y));
    }, h = () => {
      i.value = !i.value, r.value = !i.value, a("pane-toggle", i.value);
    }, g = (y) => {
      const v = d.value.indexOf(y);
      v > -1 ? d.value.splice(v, 1) : d.value = [...d.value, y];
    };
    return (y, v) => {
      const p = Ae("router-link");
      return n(), l("div", {
        class: w(["fluent-navigation-view", { "is-expanded": i.value, "is-compact": r.value }])
      }, [
        u("nav", wi, [
          u("div", _i, [
            e.showToggleButton ? (n(), l("button", {
              key: 0,
              class: "pane-toggle-button",
              onClick: h
            }, [
              F(C, {
                icon: "global-nav-button-20-regular",
                width: 20
              })
            ])) : f("", !0),
            e.paneTitle ? (n(), l("div", Si, k(e.paneTitle), 1)) : f("", !0)
          ]),
          u("div", xi, [
            e.showSearchBox ? (n(), l("div", Ci, [
              F(Ze, { placeholder: "搜索" })
            ])) : f("", !0),
            u("div", Fi, [
              (n(!0), l(O, null, j(e.menuItems, ($) => {
                var I;
                return n(), l(O, {
                  key: $.id
                }, [
                  $.type === "separator" ? (n(), l("div", Vi)) : $.type === "header" ? (n(), l("div", Ii, k($.label), 1)) : (n(), l("div", Bi, [
                    (I = $.children) != null && I.length ? (n(), l("button", {
                      key: 0,
                      type: "button",
                      class: w(["menu-item", { "is-selected": c.value === $.id, "is-disabled": $.disabled }]),
                      "aria-expanded": d.value.includes($.id),
                      disabled: $.disabled,
                      onClick: (S) => g($.id)
                    }, [
                      $.icon ? (n(), L(C, {
                        key: 0,
                        icon: $.icon,
                        width: 20
                      }, null, 8, ["icon"])) : f("", !0),
                      u("span", Ti, k($.label), 1),
                      F(C, {
                        icon: "chevron-down-20-regular",
                        width: 16,
                        class: w(["menu-chevron", { rotated: d.value.includes($.id) }])
                      }, null, 8, ["class"])
                    ], 10, Mi)) : (n(), L(p, {
                      key: 1,
                      to: $.to,
                      class: w(["menu-item", { "is-selected": c.value === $.id, "is-disabled": $.disabled }]),
                      "aria-disabled": $.disabled || void 0,
                      onClick: (S) => b($)
                    }, {
                      default: Y(() => [
                        $.icon ? (n(), L(C, {
                          key: 0,
                          icon: $.icon,
                          width: 20
                        }, null, 8, ["icon"])) : f("", !0),
                        u("span", Pi, k($.label), 1),
                        $.badge ? (n(), l("span", Ri, k($.badge), 1)) : f("", !0)
                      ]),
                      _: 2
                    }, 1032, ["to", "class", "aria-disabled", "onClick"])),
                    $.children && d.value.includes($.id) ? (n(), l("div", Ni, [
                      (n(!0), l(O, null, j($.children, (S) => (n(), L(p, {
                        key: S.id,
                        to: S.to,
                        class: w(["menu-item menu-child-item", { "is-selected": c.value === S.id, "is-disabled": S.disabled }]),
                        "aria-disabled": S.disabled || void 0,
                        onClick: (M) => b(S)
                      }, {
                        default: Y(() => [
                          S.icon ? (n(), L(C, {
                            key: 0,
                            icon: S.icon,
                            width: 20
                          }, null, 8, ["icon"])) : f("", !0),
                          u("span", zi, k(S.label), 1)
                        ]),
                        _: 2
                      }, 1032, ["to", "class", "aria-disabled", "onClick"]))), 128))
                    ])) : f("", !0)
                  ]))
                ], 64);
              }), 128))
            ]),
            u("div", Ai, [
              N(y.$slots, "footer", {}, void 0, !0)
            ])
          ])
        ]),
        u("main", Ei, [
          N(y.$slots, "default", {}, void 0, !0)
        ])
      ], 2);
    };
  }
}, Di = /* @__PURE__ */ B(Li, [["__scopeId", "data-v-1ac29345"]]), Oi = {
  key: 0,
  class: "number-box-label"
}, Ki = { class: "number-box-container" }, qi = ["value", "placeholder", "disabled", "min", "max", "step"], Hi = {
  key: 0,
  class: "number-box-spin-buttons"
}, ji = ["disabled"], Wi = ["disabled"], Gi = {
  key: 1,
  class: "number-box-error"
}, Ui = {
  key: 2,
  class: "number-box-description"
}, Yi = {
  __name: "FluentNumberBox",
  props: {
    modelValue: { type: Number, default: 0 },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    min: { type: Number, default: -1 / 0 },
    max: { type: Number, default: 1 / 0 },
    step: { type: Number, default: 1 },
    showSpinButtons: { type: Boolean, default: !0 },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change", "focus", "blur"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = x(() => t.modelValue < t.max), r = x(() => t.modelValue > t.min), c = (v) => {
      const p = parseFloat(v.target.value);
      isNaN(p) || a("update:modelValue", p);
    }, d = (v) => {
      const p = parseFloat(v.target.value);
      isNaN(p) || a("change", p);
    }, m = (v) => {
      a("focus", v);
    }, b = (v) => {
      a("blur", v);
    }, h = (v) => {
      v.key === "ArrowUp" ? (v.preventDefault(), g()) : v.key === "ArrowDown" && (v.preventDefault(), y());
    }, g = () => {
      if (i.value) {
        const v = Math.min(t.max, t.modelValue + t.step);
        a("update:modelValue", v), a("change", v);
      }
    }, y = () => {
      if (r.value) {
        const v = Math.max(t.min, t.modelValue - t.step);
        a("update:modelValue", v), a("change", v);
      }
    };
    return (v, p) => (n(), l("div", {
      class: w(["fluent-number-box", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", Oi, k(e.label), 1)) : f("", !0),
      u("div", Ki, [
        u("input", {
          ref_key: "inputRef",
          ref: o,
          type: "number",
          class: "number-box-input",
          value: e.modelValue,
          placeholder: e.placeholder,
          disabled: e.disabled,
          min: e.min,
          max: e.max,
          step: e.step,
          onInput: c,
          onChange: d,
          onFocus: m,
          onBlur: b,
          onKeydown: h
        }, null, 40, qi),
        e.showSpinButtons ? (n(), l("div", Hi, [
          u("button", {
            class: "spin-button spin-up",
            type: "button",
            disabled: e.disabled || !i.value,
            onClick: g
          }, [
            F(C, {
              icon: "chevron-up-16-regular",
              width: 12
            })
          ], 8, ji),
          u("button", {
            class: "spin-button spin-down",
            type: "button",
            disabled: e.disabled || !r.value,
            onClick: y
          }, [
            F(C, {
              icon: "chevron-down-16-regular",
              width: 12
            })
          ], 8, Wi)
        ])) : f("", !0)
      ]),
      e.error ? (n(), l("div", Gi, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", Ui, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, Xi = /* @__PURE__ */ B(Yi, [["__scopeId", "data-v-aeb29147"]]), Zi = { class: "fluent-page-header" }, Qi = {
  key: 0,
  class: "page-header-icon"
}, Ji = { class: "page-header-content" }, er = { class: "page-header-title" }, tr = {
  key: 0,
  class: "page-header-description"
}, nr = {
  key: 1,
  class: "page-header-actions"
}, lr = {
  __name: "FluentPageHeader",
  props: {
    title: { type: String, required: !0 },
    description: { type: String, default: "" },
    icon: { type: String, default: "" }
  },
  setup(e) {
    return (s, t) => (n(), l("div", Zi, [
      e.icon ? (n(), l("div", Qi, [
        F(C, {
          icon: e.icon,
          width: 20
        }, null, 8, ["icon"])
      ])) : f("", !0),
      u("div", Ji, [
        u("h1", er, k(e.title), 1),
        e.description ? (n(), l("p", tr, k(e.description), 1)) : f("", !0)
      ]),
      s.$slots.actions ? (n(), l("div", nr, [
        N(s.$slots, "actions", {}, void 0, !0)
      ])) : f("", !0)
    ]));
  }
}, ar = /* @__PURE__ */ B(lr, [["__scopeId", "data-v-1799cece"]]), or = {
  key: 0,
  class: "password-box-label"
}, sr = { class: "password-box-container" }, ir = ["type", "value", "placeholder", "disabled", "maxlength"], rr = ["disabled"], ur = {
  key: 1,
  class: "password-box-error"
}, cr = {
  key: 2,
  class: "password-box-description"
}, dr = {
  __name: "FluentPasswordBox",
  props: {
    modelValue: { type: String, default: "" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "输入密码" },
    disabled: { type: Boolean, default: !1 },
    maxLength: { type: Number, default: 0 },
    showRevealButton: { type: Boolean, default: !0 },
    revealMode: { type: String, default: "peek" },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change", "focus", "blur"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(!1), r = _(!1), c = x(() => t.revealMode === "visible" || i.value || r.value ? "text" : "password"), d = x(() => i.value || r.value ? "eye-hide-16-regular" : "eye-16-regular"), m = ($) => {
      a("update:modelValue", $.target.value);
    }, b = ($) => {
      a("change", $.target.value);
    }, h = ($) => {
      a("focus", $);
    }, g = ($) => {
      a("blur", $);
    }, y = () => {
      t.revealMode === "peek" && (i.value = !0);
    }, v = () => {
      i.value = !1;
    }, p = () => {
      t.revealMode === "click" && (r.value = !r.value);
    };
    return ($, I) => (n(), l("div", {
      class: w(["fluent-password-box", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", or, k(e.label), 1)) : f("", !0),
      u("div", sr, [
        u("input", {
          ref_key: "inputRef",
          ref: o,
          type: c.value,
          class: "password-box-input",
          value: e.modelValue,
          placeholder: e.placeholder,
          disabled: e.disabled,
          maxlength: e.maxLength,
          onInput: m,
          onChange: b,
          onFocus: h,
          onBlur: g
        }, null, 40, ir),
        e.modelValue && e.showRevealButton ? (n(), l("button", {
          key: 0,
          class: "password-box-reveal",
          type: "button",
          disabled: e.disabled,
          onMousedown: y,
          onMouseup: v,
          onMouseleave: v,
          onClick: p
        }, [
          F(C, {
            icon: d.value,
            width: 16
          }, null, 8, ["icon"])
        ], 40, rr)) : f("", !0)
      ]),
      e.error ? (n(), l("div", ur, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", cr, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, fr = /* @__PURE__ */ B(dr, [["__scopeId", "data-v-20faac55"]]), mr = {
  __name: "FluentParallaxView",
  props: {
    speed: { type: Number, default: 0.5 },
    direction: { type: String, default: "vertical" }
  },
  setup(e) {
    const s = e, t = _(null), a = _(0), o = x(() => {
      const r = a.value * s.speed;
      return s.direction === "vertical" ? { transform: `translateY(${r}px)` } : { transform: `translateX(${r}px)` };
    }), i = () => {
      t.value && (a.value = t.value.scrollTop);
    };
    return re(() => {
      var r;
      (r = t.value) == null || r.addEventListener("scroll", i);
    }), ce(() => {
      var r;
      (r = t.value) == null || r.removeEventListener("scroll", i);
    }), (r, c) => (n(), l("div", {
      class: "fluent-parallax-view",
      ref_key: "containerRef",
      ref: t,
      onScroll: i
    }, [
      u("div", {
        class: "parallax-content",
        style: D(o.value)
      }, [
        N(r.$slots, "default", {}, void 0, !0)
      ], 4)
    ], 544));
  }
}, vr = /* @__PURE__ */ B(mr, [["__scopeId", "data-v-a35af2a5"]]), pr = ["aria-label"], hr = ["src", "alt"], yr = {
  key: 1,
  class: "person-picture-initials"
}, br = {
  __name: "FluentPersonPicture",
  props: {
    src: { type: String, default: "" },
    displayName: { type: String, default: "" },
    initials: { type: String, default: "" },
    size: { type: Number, default: 32 },
    shape: { type: String, default: "circle" }
  },
  setup(e) {
    const s = e, t = _(!1), a = x(() => s.initials ? s.initials.slice(0, 2).toUpperCase() : s.displayName ? s.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((c) => c[0]).join("").toUpperCase() : ""), o = x(() => Math.max(12, s.size * 0.5)), i = x(() => ({
      width: `${s.size}px`,
      height: `${s.size}px`,
      fontSize: `${Math.max(12, s.size * 0.4)}px`,
      borderRadius: s.shape === "square" ? "4px" : "50%"
    })), r = () => {
      t.value = !0;
    };
    return (c, d) => (n(), l("div", {
      class: "fluent-person-picture",
      style: D(i.value),
      "aria-label": e.displayName || e.initials || void 0
    }, [
      e.src && !t.value ? (n(), l("img", {
        key: 0,
        src: e.src,
        alt: e.displayName,
        class: "person-picture-image",
        onError: r
      }, null, 40, hr)) : a.value ? (n(), l("span", yr, k(a.value), 1)) : (n(), L(C, {
        key: 2,
        icon: "person-20-regular",
        width: o.value,
        class: "person-picture-icon"
      }, null, 8, ["width"]))
    ], 12, pr));
  }
}, gr = /* @__PURE__ */ B(br, [["__scopeId", "data-v-69d3220b"]]), kr = ["disabled"], $r = { class: "pips-container" }, wr = { class: "pips-track" }, _r = ["disabled", "onClick", "aria-label", "aria-current"], Sr = ["disabled"], xr = {
  __name: "FluentPipsPager",
  props: {
    modelValue: { type: Number, default: 0 },
    totalPages: { type: Number, required: !0 },
    maxVisiblePips: { type: Number, default: 7 },
    showNavigation: { type: Boolean, default: !0 },
    vertical: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x(() => {
      const d = [], m = Math.floor(t.maxVisiblePips / 2);
      let b = Math.max(0, t.modelValue - m), h = Math.min(t.totalPages - 1, b + t.maxVisiblePips - 1);
      h - b + 1 < t.maxVisiblePips && (b = Math.max(0, h - t.maxVisiblePips + 1));
      for (let g = b; g <= h; g++)
        d.push(g);
      return d;
    }), i = (d) => {
      t.disabled || (a("update:modelValue", d), a("change", d));
    }, r = () => {
      t.disabled || t.modelValue <= 0 || i(t.modelValue - 1);
    }, c = () => {
      t.disabled || t.modelValue >= t.totalPages - 1 || i(t.modelValue + 1);
    };
    return (d, m) => (n(), l("div", {
      class: w(["fluent-pips-pager", { "is-disabled": e.disabled, "is-vertical": e.vertical }])
    }, [
      e.showNavigation ? (n(), l("button", {
        key: 0,
        class: "pager-button previous-button",
        disabled: e.disabled || e.modelValue <= 0,
        onClick: r,
        "aria-label": "上一页"
      }, [
        F(C, {
          icon: e.vertical ? "chevron-up-20-regular" : "chevron-left-20-regular",
          width: 12
        }, null, 8, ["icon"])
      ], 8, kr)) : f("", !0),
      u("div", $r, [
        u("div", wr, [
          (n(!0), l(O, null, j(o.value, (b) => (n(), l("button", {
            key: b,
            class: w(["pip", { "is-selected": b === e.modelValue }]),
            disabled: e.disabled,
            onClick: (h) => i(b),
            "aria-label": `第 ${b + 1} 页`,
            "aria-current": b === e.modelValue ? "page" : void 0
          }, [...m[0] || (m[0] = [
            u("span", { class: "pip-dot" }, null, -1)
          ])], 10, _r))), 128))
        ])
      ]),
      e.showNavigation ? (n(), l("button", {
        key: 1,
        class: "pager-button next-button",
        disabled: e.disabled || e.modelValue >= e.totalPages - 1,
        onClick: c,
        "aria-label": "下一页"
      }, [
        F(C, {
          icon: e.vertical ? "chevron-down-20-regular" : "chevron-right-20-regular",
          width: 12
        }, null, 8, ["icon"])
      ], 8, Sr)) : f("", !0)
    ], 2));
  }
}, Cr = /* @__PURE__ */ B(xr, [["__scopeId", "data-v-6bbdd9d7"]]), Fr = {
  class: "pivot-header",
  role: "tablist"
}, Vr = ["aria-selected", "aria-disabled", "disabled", "onClick"], Ir = { class: "pivot-header-text" }, Br = {
  class: "pivot-content",
  role: "tabpanel"
}, Mr = {
  __name: "FluentPivot",
  props: {
    items: { type: Array, required: !0 },
    modelValue: { type: Number, default: 0 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x({
      get: () => t.modelValue,
      set: (r) => {
        a("update:modelValue", r), a("change", r);
      }
    }), i = (r) => {
      var c;
      t.disabled || (c = t.items[r]) != null && c.disabled || (o.value = r);
    };
    return (r, c) => (n(), l("div", {
      class: w(["fluent-pivot", { "is-disabled": e.disabled }])
    }, [
      u("div", Fr, [
        (n(!0), l(O, null, j(e.items, (d, m) => (n(), l("button", {
          key: m,
          class: w(["pivot-header-item", { "is-selected": o.value === m, "is-disabled": d.disabled }]),
          role: "tab",
          "aria-selected": o.value === m,
          "aria-disabled": d.disabled || e.disabled,
          disabled: d.disabled || e.disabled,
          onClick: (b) => i(m)
        }, [
          d.icon ? (n(), L(C, {
            key: 0,
            icon: d.icon,
            width: 16
          }, null, 8, ["icon"])) : f("", !0),
          u("span", Ir, k(d.label), 1),
          c[0] || (c[0] = u("div", { class: "pivot-indicator" }, null, -1))
        ], 10, Vr))), 128))
      ]),
      u("div", Br, [
        N(r.$slots, `tab-${o.value}`, {
          item: e.items[o.value],
          index: o.value
        }, () => [
          N(r.$slots, "default", {
            item: e.items[o.value],
            index: o.value
          }, void 0, !0)
        ], !0)
      ])
    ], 2));
  }
}, Tr = /* @__PURE__ */ B(Mr, [["__scopeId", "data-v-1e1ea11e"]]), Pr = { class: "fluent-pivot-item" }, Rr = {
  __name: "FluentPivotItem",
  props: {
    itemKey: { type: [String, Number], required: !0 },
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 }
  },
  setup(e) {
    const s = e, t = Ue("pivot"), a = x(() => (t == null ? void 0 : t.activeKey) === s.itemKey);
    return (o, i) => Ce((n(), l("div", Pr, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 512)), [
      [Fe, a.value]
    ]);
  }
}, Nr = /* @__PURE__ */ B(Rr, [["__scopeId", "data-v-4053edaf"]]), zr = {
  __name: "FluentPopup",
  props: {
    modelValue: { type: Boolean, default: !1 },
    placement: { type: String, default: "bottom" },
    target: { type: [Object, String], default: null },
    offset: { type: Number, default: 8 },
    closeOnOverlay: { type: Boolean, default: !0 },
    closeOnEscape: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _({ top: 0, left: 0 }), r = x({
      get: () => t.modelValue,
      set: (h) => {
        a("update:modelValue", h), h ? (a("open"), ve(d)) : a("close");
      }
    }), c = x(() => ({
      top: `${i.value.top}px`,
      left: `${i.value.left}px`
    })), d = () => {
      if (!o.value) return;
      let h = null;
      if (t.target && (h = typeof t.target == "string" ? document.querySelector(t.target) : t.target), !h) {
        i.value = { top: window.innerHeight / 2, left: window.innerWidth / 2 };
        return;
      }
      const g = h.getBoundingClientRect(), y = o.value.getBoundingClientRect();
      let v = 0, p = 0;
      switch (t.placement) {
        case "top":
          v = g.top - y.height - t.offset, p = g.left + (g.width - y.width) / 2;
          break;
        case "bottom":
          v = g.bottom + t.offset, p = g.left + (g.width - y.width) / 2;
          break;
        case "left":
          v = g.top + (g.height - y.height) / 2, p = g.left - y.width - t.offset;
          break;
        case "right":
          v = g.top + (g.height - y.height) / 2, p = g.right + t.offset;
          break;
      }
      v = Math.max(t.offset, Math.min(v, window.innerHeight - y.height - t.offset)), p = Math.max(t.offset, Math.min(p, window.innerWidth - y.width - t.offset)), i.value = { top: v, left: p };
    }, m = () => {
      r.value = !1;
    }, b = (h) => {
      h.key === "Escape" && t.closeOnEscape && r.value && m();
    };
    return J(() => t.modelValue, (h) => {
      h && ve(d);
    }), re(() => {
      document.addEventListener("keydown", b);
    }), ce(() => {
      document.removeEventListener("keydown", b);
    }), (h, g) => (n(), L(fe, { to: "body" }, [
      F(te, { name: "popup" }, {
        default: Y(() => [
          r.value ? (n(), l("div", {
            key: 0,
            class: "fluent-popup-overlay",
            onClick: g[0] || (g[0] = ee((y) => e.closeOnOverlay && m(), ["self"]))
          }, [
            u("div", {
              ref_key: "popupRef",
              ref: o,
              class: w(["fluent-popup", [`placement-${e.placement}`]]),
              style: D(c.value)
            }, [
              N(h.$slots, "default", {}, void 0, !0)
            ], 6)
          ])) : f("", !0)
        ]),
        _: 3
      })
    ]));
  }
}, Ar = /* @__PURE__ */ B(zr, [["__scopeId", "data-v-f7a88f1d"]]), Er = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], Lr = { class: "progress-track" }, Dr = {
  key: 1,
  class: "progress-indeterminate"
}, Or = {
  __name: "FluentProgressBar",
  props: {
    value: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    indeterminate: { type: Boolean, default: !1 },
    error: { type: Boolean, default: !1 },
    paused: { type: Boolean, default: !1 }
  },
  setup(e) {
    const s = e, t = x(() => s.max === s.min ? 0 : (s.value - s.min) / (s.max - s.min) * 100), a = x(() => ({
      width: `${t.value}%`
    }));
    return (o, i) => (n(), l("div", {
      class: w(["fluent-progress-bar", {
        "is-indeterminate": e.indeterminate,
        "is-error": e.error,
        "is-paused": e.paused
      }]),
      role: "progressbar",
      "aria-valuenow": e.indeterminate ? void 0 : t.value,
      "aria-valuemin": e.indeterminate ? void 0 : 0,
      "aria-valuemax": e.indeterminate ? void 0 : 100
    }, [
      u("div", Lr, [
        e.indeterminate ? f("", !0) : (n(), l("div", {
          key: 0,
          class: "progress-fill",
          style: D(a.value)
        }, null, 4)),
        e.indeterminate ? (n(), l("div", Dr)) : f("", !0)
      ])
    ], 10, Er));
  }
}, Kr = /* @__PURE__ */ B(Or, [["__scopeId", "data-v-69dfaecd"]]), qr = { class: "indicator-text" }, Hr = {
  __name: "FluentPullToRefresh",
  props: {
    threshold: { type: Number, default: 80 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["refresh"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(0), i = _(0), r = _(!1), c = _(!1), d = _(0), m = x(() => c.value ? "刷新中..." : d.value >= t.threshold ? "释放刷新" : "下拉刷新"), b = x(() => ({
      transform: `translateY(${Math.min(d.value, t.threshold)}px)`,
      opacity: r.value || c.value ? 1 : 0
    })), h = x(() => ({
      transform: `translateY(${r.value ? d.value : 0}px)`,
      transition: r.value ? "none" : "transform 0.3s ease"
    })), g = (p) => {
      t.disabled || c.value || (o.value = p.touches[0].clientY, r.value = !0);
    }, y = (p) => {
      if (!r.value || t.disabled) return;
      i.value = p.touches[0].clientY;
      const $ = i.value - o.value;
      $ > 0 && (d.value = Math.min($ * 0.5, t.threshold * 1.5));
    }, v = () => {
      r.value && (r.value = !1, d.value >= t.threshold ? (c.value = !0, a("refresh", () => {
        c.value = !1, d.value = 0;
      })) : d.value = 0);
    };
    return (p, $) => (n(), l("div", {
      class: w(["fluent-pull-to-refresh", { "is-pulling": r.value, "is-refreshing": c.value }]),
      onTouchstart: g,
      onTouchmove: y,
      onTouchend: v
    }, [
      u("div", {
        class: "pull-indicator",
        style: D(b.value)
      }, [
        u("div", {
          class: w(["indicator-icon", { "is-spinning": c.value }])
        }, [
          F(C, {
            icon: "arrow-sync-20-regular",
            width: 20
          })
        ], 2),
        u("span", qr, k(m.value), 1)
      ], 4),
      u("div", {
        class: "pull-content",
        style: D(h.value)
      }, [
        N(p.$slots, "default", {}, void 0, !0)
      ], 4)
    ], 34));
  }
}, jr = /* @__PURE__ */ B(Hr, [["__scopeId", "data-v-5dd58444"]]), Wr = {
  key: 0,
  class: "radio-buttons-label"
}, Gr = { class: "radio-buttons-items" }, Ur = ["checked", "disabled", "onChange"], Yr = { class: "radio-glyph" }, Xr = {
  key: 0,
  class: "radio-check"
}, Zr = { class: "radio-content" }, Qr = {
  __name: "FluentRadioButton",
  props: {
    modelValue: { type: [String, Number, Boolean, Object], default: void 0 },
    items: { type: Array, required: !0 },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    selectedIndex: { type: Number, default: void 0 }
  },
  emits: ["update:modelValue", "update:selectedIndex", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = `fluent-radio-buttons-${Math.random().toString(36).slice(2)}`, i = x(() => t.items.map((d) => typeof d == "string" || typeof d == "number" ? { label: String(d), value: d } : {
      label: d.label || d.text || String(d.value),
      value: d.value
    })), r = x(() => t.selectedIndex !== void 0 ? t.selectedIndex : t.modelValue !== void 0 ? i.value.findIndex((d) => d.value === t.modelValue) : -1), c = (d) => {
      if (t.disabled) return;
      const m = i.value[d];
      a("update:modelValue", m.value), a("update:selectedIndex", d), a("change", { value: m.value, index: d });
    };
    return (d, m) => (n(), l("div", {
      class: w(["fluent-radio-buttons", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", Wr, k(e.label), 1)) : f("", !0),
      u("div", Gr, [
        (n(!0), l(O, null, j(i.value, (b, h) => (n(), l("label", {
          key: h,
          class: w(["fluent-radio-button", { "is-checked": r.value === h, "is-disabled": e.disabled }])
        }, [
          u("input", {
            class: "radio-input",
            type: "radio",
            name: o,
            checked: r.value === h,
            disabled: e.disabled,
            onChange: (g) => c(h)
          }, null, 40, Ur),
          u("span", Yr, [
            r.value === h ? (n(), l("span", Xr)) : f("", !0)
          ]),
          u("span", Zr, k(b.label), 1)
        ], 2))), 128))
      ])
    ], 2));
  }
}, Jr = /* @__PURE__ */ B(Qr, [["__scopeId", "data-v-d3a0733f"]]), eu = ["aria-valuemax", "aria-valuenow", "aria-readonly", "aria-disabled", "tabindex"], tu = { class: "rating-items-container" }, nu = {
  class: "rating-foreground",
  "aria-hidden": "true"
}, lu = { class: "rating-foreground-items" }, au = {
  key: 0,
  class: "rating-caption"
}, ou = {
  __name: "FluentRating",
  props: {
    modelValue: { type: Number, default: -1 },
    maxRating: { type: Number, default: 5 },
    placeholderValue: { type: Number, default: -1 },
    caption: { type: String, default: "" },
    iconSize: { type: Number, default: 20 },
    initialValue: { type: Number, default: 1 },
    clearEnabled: { type: Boolean, default: !0 },
    readonly: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(!1), r = _(!1), c = _(0), d = _(-1), m = x(() => Math.max(1, Math.trunc(t.maxRating))), b = x(() => Array.from({ length: m.value }, (H, X) => X + 1)), h = x(() => d.value), g = x(() => Math.max(1, Math.min(m.value, Math.trunc(t.initialValue)))), y = (H) => {
      const X = Number(H);
      return !Number.isFinite(X) || X < 0 ? -1 : X < 1 ? 1 : X > m.value ? m.value : X;
    };
    J(() => t.modelValue, (H) => {
      d.value = y(H);
    }, { immediate: !0 });
    const v = x(() => i.value && !t.readonly && !t.disabled ? Math.max(0, Math.min(m.value, c.value)) : h.value > -1 ? h.value : t.placeholderValue > -1 ? t.placeholderValue : 0), p = x(() => ({
      "is-readonly": t.readonly,
      "is-disabled": t.disabled,
      "is-pointer-over": i.value && !t.readonly && !t.disabled,
      "is-set": h.value > -1,
      "is-placeholder": h.value <= -1 && t.placeholderValue > -1
    })), $ = (H) => ({ clipPath: `inset(0 ${(1 - Math.max(0, Math.min(1, v.value - (H - 1)))) * 100}% 0 0)` }), I = (H) => {
      var le;
      const X = (le = o.value) == null ? void 0 : le.getBoundingClientRect();
      if (!X || X.width <= 0) return 0;
      const ne = (H.clientX - X.left) / X.width;
      return Math.max(0, Math.min(m.value, Math.ceil(ne * m.value)));
    }, S = (H) => {
      c.value = I(H);
    }, M = (H, X = !1) => {
      const ne = h.value, le = Math.max(0, Math.min(m.value, H));
      let ue = ne;
      (ne > -1 || le !== 0) && (!t.clearEnabled && le <= 0 ? ue = 1 : le === ne && t.clearEnabled && (le !== m.value || X) ? ue = -1 : le > 0 ? ue = le : ue = -1), ue !== ne && (d.value = ue, a("update:modelValue", ue), a("change", ue));
    }, P = (H, X = !1) => {
      if (H === 0) return;
      let ne;
      h.value > -1 ? Math.trunc(h.value) !== h.value ? ne = H === -1 ? Math.trunc(h.value) : Math.trunc(h.value) + H : ne = h.value + H : ne = g.value, M(ne, X);
    }, R = () => {
      i.value = !0;
    }, z = (H) => {
      !t.readonly && !t.disabled && S(H);
    }, K = () => {
      i.value = !1;
    }, E = (H) => {
      t.readonly || t.disabled || (r.value = !0, S(H));
    }, U = () => {
      t.readonly || t.disabled || (r.value = !1, M(c.value, !0));
    }, G = (H) => {
      if (!(t.readonly || t.disabled))
        switch (H.key) {
          case "ArrowRight":
          case "ArrowUp":
            H.preventDefault(), P(1);
            break;
          case "ArrowLeft":
          case "ArrowDown":
            H.preventDefault(), P(-1);
            break;
          case "Home":
            H.preventDefault(), M(1);
            break;
          case "End":
            H.preventDefault(), M(m.value);
            break;
          case "Delete":
          case "Backspace":
            t.clearEnabled && (H.preventDefault(), M(-1));
            break;
        }
    };
    return (H, X) => (n(), l("div", {
      class: w(["fluent-rating", p.value]),
      role: "slider",
      "aria-valuemin": 0,
      "aria-valuemax": m.value,
      "aria-valuenow": v.value,
      "aria-readonly": e.readonly,
      "aria-disabled": e.disabled,
      tabindex: e.disabled ? -1 : 0,
      onKeydown: G
    }, [
      u("div", tu, [
        u("div", {
          ref_key: "itemsRef",
          ref: o,
          class: "rating-items",
          onPointerenter: R,
          onPointermove: z,
          onPointerleave: K,
          onPointerdown: E,
          onPointerup: U
        }, [
          (n(!0), l(O, null, j(b.value, (ne) => (n(), l("span", {
            key: `bg-${ne}`,
            class: "rating-item rating-background",
            "aria-hidden": "true"
          }, [
            F(C, {
              icon: "star-20-regular",
              width: e.iconSize
            }, null, 8, ["width"])
          ]))), 128))
        ], 544),
        u("div", nu, [
          u("div", lu, [
            (n(!0), l(O, null, j(b.value, (ne) => (n(), l("span", {
              key: `fg-${ne}`,
              class: "rating-item rating-foreground-item",
              style: D($(ne))
            }, [
              F(C, {
                icon: "star-20-filled",
                width: e.iconSize
              }, null, 8, ["width"])
            ], 4))), 128))
          ])
        ])
      ]),
      e.caption ? (n(), l("span", au, k(e.caption), 1)) : f("", !0)
    ], 42, eu));
  }
}, su = /* @__PURE__ */ B(ou, [["__scopeId", "data-v-6407845a"]]), iu = {
  __name: "FluentRelativePanel",
  props: {
    padding: { type: [String, Number], default: 0 },
    background: { type: String, default: "transparent" }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => ({
      padding: t(s.padding),
      background: s.background
    }));
    return (o, i) => (n(), l("div", {
      class: "fluent-relative-panel",
      style: D(a.value)
    }, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}, ru = /* @__PURE__ */ B(iu, [["__scopeId", "data-v-f426fae9"]]), uu = ["disabled"], cu = {
  __name: "FluentRepeatButton",
  props: {
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    delay: { type: Number, default: 500 },
    interval: { type: Number, default: 100 }
  },
  emits: ["click"],
  setup(e, { emit: s }) {
    const t = e, a = s;
    let o = null, i = null;
    const r = (d) => {
      t.disabled || (d.currentTarget.setPointerCapture(d.pointerId), a("click"), o = setTimeout(() => {
        i = setInterval(() => {
          a("click");
        }, t.interval);
      }, t.delay));
    }, c = () => {
      o && (clearTimeout(o), o = null), i && (clearInterval(i), i = null);
    };
    return Ee(() => {
      c();
    }), (d, m) => (n(), l("button", {
      class: w(["fluent-repeat-button", { "is-disabled": e.disabled }]),
      disabled: e.disabled,
      onPointerdown: r,
      onPointerup: c,
      onPointerleave: c,
      onPointercancel: c,
      onContextmenu: m[0] || (m[0] = ee(() => {
      }, ["prevent"]))
    }, [
      N(d.$slots, "default", {}, () => [
        oe(k(e.label), 1)
      ], !0)
    ], 42, uu));
  }
}, du = /* @__PURE__ */ B(cu, [["__scopeId", "data-v-8e3a3080"]]), fu = { class: "result-icon" }, mu = {
  key: 0,
  class: "result-title"
}, vu = {
  key: 1,
  class: "result-description"
}, pu = {
  key: 2,
  class: "result-action"
}, hu = {
  __name: "FluentResult",
  props: {
    status: { type: String, default: "info" },
    // info, success, warning, error, 404, 403, 500
    title: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  setup(e) {
    const s = e, t = x(() => {
      const a = {
        info: "info-20-regular",
        success: "checkmark-circle-20-regular",
        warning: "warning-20-regular",
        error: "dismiss-circle-20-regular",
        404: "error-circle-20-regular",
        403: "lock-closed-20-regular",
        500: "error-circle-20-regular"
      };
      return a[s.status] || a.info;
    });
    return (a, o) => (n(), l("div", {
      class: w(["fluent-result", [`status-${e.status}`]])
    }, [
      u("div", fu, [
        F(C, {
          icon: t.value,
          width: 48
        }, null, 8, ["icon"])
      ]),
      e.title ? (n(), l("div", mu, k(e.title), 1)) : f("", !0),
      e.description ? (n(), l("div", vu, k(e.description), 1)) : f("", !0),
      a.$slots.action ? (n(), l("div", pu, [
        N(a.$slots, "action", {}, void 0, !0)
      ])) : f("", !0)
    ], 2));
  }
}, yu = /* @__PURE__ */ B(hu, [["__scopeId", "data-v-6fbb89b1"]]), bu = {
  key: 0,
  class: "rich-edit-box-label"
}, gu = { class: "rich-edit-box-container" }, ku = {
  key: 0,
  class: "rich-edit-box-toolbar"
}, $u = ["title", "onClick"], wu = ["placeholder"], _u = {
  key: 1,
  class: "rich-edit-box-error"
}, Su = {
  key: 2,
  class: "rich-edit-box-description"
}, xu = {
  __name: "FluentRichEditBox",
  props: {
    modelValue: { type: String, default: "" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "输入内容..." },
    disabled: { type: Boolean, default: !1 },
    showToolbar: { type: Boolean, default: !0 },
    maxLength: { type: Number, default: 0 },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change", "focus", "blur"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(!1), r = [
      { command: "bold", icon: "text-bold-20-regular", title: "粗体" },
      { command: "italic", icon: "text-italic-20-regular", title: "斜体" },
      { command: "underline", icon: "text-underline-20-regular", title: "下划线" },
      { command: "strikeThrough", icon: "text-strikethrough-20-regular", title: "删除线" },
      { command: "insertUnorderedList", icon: "list-20-regular", title: "无序列表" },
      { command: "insertOrderedList", icon: "list-numbered-20-regular", title: "有序列表" },
      { command: "justifyLeft", icon: "text-align-left-20-regular", title: "左对齐" },
      { command: "justifyCenter", icon: "text-align-center-20-regular", title: "居中" },
      { command: "justifyRight", icon: "text-align-right-20-regular", title: "右对齐" }
    ], c = (y) => document.queryCommandState(y), d = (y) => {
      var v;
      document.execCommand(y, !1, null), (v = o.value) == null || v.focus();
    }, m = () => {
      var v;
      const y = ((v = o.value) == null ? void 0 : v.innerHTML) || "";
      a("update:modelValue", y), a("change", y);
    }, b = () => {
      i.value = !0, a("focus");
    }, h = () => {
      i.value = !1, a("blur");
    }, g = (y) => {
      if (y.ctrlKey || y.metaKey)
        switch (y.key) {
          case "b":
            y.preventDefault(), d("bold");
            break;
          case "i":
            y.preventDefault(), d("italic");
            break;
          case "u":
            y.preventDefault(), d("underline");
            break;
        }
    };
    return J(() => t.modelValue, (y) => {
      o.value && o.value.innerHTML !== y && (o.value.innerHTML = y || "");
    }), re(() => {
      o.value && (o.value.innerHTML = t.modelValue || "");
    }), (y, v) => (n(), l("div", {
      class: w(["fluent-rich-edit-box", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", bu, k(e.label), 1)) : f("", !0),
      u("div", gu, [
        e.showToolbar ? (n(), l("div", ku, [
          (n(), l(O, null, j(r, (p) => u("button", {
            key: p.command,
            class: w(["toolbar-button", { "is-active": c(p.command) }]),
            title: p.title,
            onClick: ($) => d(p.command)
          }, [
            F(C, {
              icon: p.icon,
              width: 16
            }, null, 8, ["icon"])
          ], 10, $u)), 64))
        ])) : f("", !0),
        u("div", {
          ref_key: "editorRef",
          ref: o,
          class: "rich-edit-box-editor",
          contenteditable: "true",
          placeholder: e.placeholder,
          onInput: m,
          onFocus: b,
          onBlur: h,
          onKeydown: g
        }, null, 40, wu)
      ]),
      e.error ? (n(), l("div", _u, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", Su, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, Cu = /* @__PURE__ */ B(xu, [["__scopeId", "data-v-cf8a2d17"]]), Fu = ["innerHTML"], Vu = {
  __name: "FluentRichTextBlock",
  props: {
    text: { type: String, default: "" },
    selectable: { type: Boolean, default: !1 }
  },
  setup(e) {
    return (s, t) => (n(), l("div", {
      class: w(["fluent-rich-text-block", { "is-selectable": e.selectable }])
    }, [
      e.text ? (n(), l("div", {
        key: 0,
        class: "rich-text-content",
        innerHTML: e.text
      }, null, 8, Fu)) : f("", !0),
      N(s.$slots, "default", {}, void 0, !0)
    ], 2));
  }
}, Iu = /* @__PURE__ */ B(Vu, [["__scopeId", "data-v-8505c9f1"]]), Bu = {
  __name: "FluentRow",
  props: {
    gutter: { type: [Number, Array], default: 0 },
    justify: { type: String, default: "start" },
    // start, end, center, space-between, space-around, space-evenly
    align: { type: String, default: "top" },
    // top, middle, bottom, stretch
    wrap: { type: Boolean, default: !0 }
  },
  setup(e) {
    const s = e, t = x(() => {
      const a = {
        justifyContent: s.justify,
        alignItems: s.align
      };
      return s.wrap && (a.flexWrap = "wrap"), Array.isArray(s.gutter) ? (a.columnGap = `${s.gutter[0]}px`, a.rowGap = `${s.gutter[1] || s.gutter[0]}px`) : s.gutter > 0 && (a.gap = `${s.gutter}px`), a;
    });
    return (a, o) => (n(), l("div", {
      class: "fluent-row",
      style: D(t.value)
    }, [
      N(a.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}, Mu = /* @__PURE__ */ B(Bu, [["__scopeId", "data-v-3f68015e"]]), Tu = {
  __name: "FluentScrollBar",
  props: {
    orientation: { type: String, default: "vertical" },
    value: { type: Number, default: 0 },
    minimum: { type: Number, default: 0 },
    maximum: { type: Number, default: 100 },
    viewportSize: { type: Number, default: 0 }
  },
  emits: ["update:value", "scroll"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1), i = _(!1);
    _(null);
    const r = _(0), c = _(0), d = x(() => {
      if (t.viewportSize <= 0) return 20;
      const $ = t.viewportSize / (t.maximum - t.minimum + t.viewportSize);
      return Math.max(20, $ * 100);
    }), m = x(() => {
      const $ = t.maximum - t.minimum;
      return $ <= 0 ? 0 : (t.value - t.minimum) / $ * (100 - d.value);
    }), b = x(() => ({
      [t.orientation === "vertical" ? "height" : "width"]: `${d.value}%`,
      [t.orientation === "vertical" ? "top" : "left"]: `${m.value}%`
    })), h = () => {
      i.value || (o.value = !1);
    }, g = ($) => {
      const I = $.currentTarget.getBoundingClientRect(), S = t.orientation === "vertical" ? ($.clientY - I.top) / I.height : ($.clientX - I.left) / I.width, M = t.minimum + S * (t.maximum - t.minimum);
      a("update:value", Math.max(t.minimum, Math.min(t.maximum, M)));
    }, y = ($) => {
      i.value = !0, r.value = t.orientation === "vertical" ? $.clientY : $.clientX, c.value = t.value, document.addEventListener("pointermove", v), document.addEventListener("pointerup", p);
    }, v = ($) => {
      var U;
      if (!i.value) return;
      const I = (U = $.target.closest(".fluent-scroll-bar")) == null ? void 0 : U.querySelector(".scroll-bar-track");
      if (!I) return;
      const S = I.getBoundingClientRect(), P = (t.orientation === "vertical" ? $.clientY : $.clientX) - r.value, R = t.orientation === "vertical" ? S.height : S.width, z = t.maximum - t.minimum, K = P / R * z, E = Math.max(t.minimum, Math.min(t.maximum, c.value + K));
      a("update:value", E);
    }, p = () => {
      i.value = !1, document.removeEventListener("pointermove", v), document.removeEventListener("pointerup", p);
    };
    return ce(() => {
      document.removeEventListener("pointermove", v), document.removeEventListener("pointerup", p);
    }), ($, I) => (n(), l("div", {
      class: w(["fluent-scroll-bar", [`orientation-${e.orientation}`]]),
      onPointerenter: I[0] || (I[0] = (S) => o.value = !0),
      onPointerleave: h
    }, [
      u("div", {
        class: "scroll-bar-track",
        onClick: g
      }, [
        u("div", {
          class: w(["scroll-bar-thumb", { "is-visible": o.value || i.value }]),
          style: D(b.value),
          onPointerdown: ee(y, ["prevent"])
        }, null, 38)
      ])
    ], 34));
  }
}, Pu = /* @__PURE__ */ B(Tu, [["__scopeId", "data-v-674f8f22"]]), Ru = {
  __name: "FluentScrollViewer",
  props: {
    horizontal: { type: Boolean, default: !1 }
  },
  emits: ["scroll"],
  setup(e, { emit: s }) {
    const t = s, a = (o) => {
      t("scroll", o);
    };
    return (o, i) => (n(), l("div", {
      class: w(["fluent-scroll-viewer", {
        "is-horizontal": e.horizontal,
        "is-vertical": !e.horizontal
      }])
    }, [
      u("div", {
        class: "scroll-viewer-viewport",
        onScroll: a
      }, [
        N(o.$slots, "default", {}, void 0, !0)
      ], 32)
    ], 2));
  }
}, Nu = /* @__PURE__ */ B(Ru, [["__scopeId", "data-v-cba6416e"]]), zu = ["disabled", "onClick"], Au = {
  key: 1,
  class: "segmented-item-label"
}, Eu = {
  __name: "FluentSegmented",
  props: {
    items: { type: Array, required: !0 },
    modelValue: { type: [String, Number], default: 0 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = x(() => typeof t.modelValue == "string" ? t.items.findIndex((d) => d.value === t.modelValue) : t.modelValue), r = x(() => ({
      width: `${100 / t.items.length}%`,
      transform: `translateX(${i.value * 100}%)`
    })), c = (d) => {
      if (t.disabled) return;
      const m = t.items[d], b = m.value !== void 0 ? m.value : d;
      a("update:modelValue", b), a("change", b);
    };
    return (d, m) => (n(), l("div", {
      class: w(["fluent-segmented", { "is-disabled": e.disabled }])
    }, [
      u("div", {
        class: "segmented-items",
        ref_key: "itemsRef",
        ref: o
      }, [
        u("div", {
          class: "segmented-indicator",
          style: D(r.value)
        }, null, 4),
        (n(!0), l(O, null, j(e.items, (b, h) => (n(), l("button", {
          key: h,
          class: w(["segmented-item", { "is-selected": i.value === h }]),
          disabled: e.disabled,
          onClick: (g) => c(h)
        }, [
          b.icon ? (n(), L(C, {
            key: 0,
            icon: b.icon,
            width: 16
          }, null, 8, ["icon"])) : f("", !0),
          b.label ? (n(), l("span", Au, k(b.label), 1)) : f("", !0)
        ], 10, zu))), 128))
      ], 512)
    ], 2));
  }
}, Lu = /* @__PURE__ */ B(Eu, [["__scopeId", "data-v-a19eb19a"]]), Du = {
  key: 0,
  class: "select-label"
}, Ou = ["disabled"], Ku = { class: "select-value" }, qu = ["onClick"], Hu = {
  key: 1,
  class: "select-error"
}, ju = {
  __name: "FluentSelect",
  props: {
    modelValue: { type: [String, Number], default: "" },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: "请选择" },
    disabled: { type: Boolean, default: !1 },
    width: { type: String, default: "" },
    label: { type: String, default: "" },
    error: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1), i = _(null), r = _(null), c = _({}), d = x(() => {
      const v = t.options.find((p) => p.value === t.modelValue);
      return v ? v.label : t.placeholder;
    });
    function m() {
      if (!r.value) return;
      const v = r.value.getBoundingClientRect(), p = 34, $ = Math.min(260, Math.max(p, t.options.length * p + 10)), I = window.innerHeight - v.bottom, S = v.top;
      let M;
      if (I < $ && S > I) {
        const P = Math.min($, S - 8);
        M = {
          position: "fixed",
          top: `${Math.max(4, v.top - P - 4)}px`,
          left: `${v.left}px`,
          width: `${v.width}px`,
          maxHeight: `${P}px`,
          zIndex: 99999
        };
      } else
        M = {
          position: "fixed",
          top: `${v.bottom + 4}px`,
          left: `${v.left}px`,
          width: `${v.width}px`,
          maxHeight: `${Math.min($, I - 8)}px`,
          zIndex: 99999
        };
      c.value = M;
    }
    function b() {
      t.disabled || (o.value ? o.value = !1 : (m(), o.value = !0));
    }
    function h(v) {
      a("update:modelValue", v), a("change", v), o.value = !1;
    }
    function g(v) {
      i.value && !i.value.contains(v.target) && (o.value = !1);
    }
    function y() {
      o.value && m();
    }
    return re(() => {
      document.addEventListener("click", g), window.addEventListener("scroll", y, !0);
    }), Ee(() => {
      document.removeEventListener("click", g), window.removeEventListener("scroll", y, !0);
    }), (v, p) => (n(), l("div", {
      class: "fluent-select-wrapper",
      ref_key: "wrapperRef",
      ref: i
    }, [
      e.label ? (n(), l("label", Du, k(e.label), 1)) : f("", !0),
      u("button", {
        class: w(["fluent-select", { open: o.value, disabled: e.disabled }]),
        style: D(e.width ? { width: e.width, minWidth: e.width } : null),
        onClick: b,
        disabled: e.disabled,
        ref_key: "btnRef",
        ref: r
      }, [
        u("span", Ku, k(d.value), 1),
        F(C, {
          icon: "chevron-down-16-regular",
          width: 16,
          class: "select-chevron"
        })
      ], 14, Ou),
      (n(), L(fe, { to: "body" }, [
        F(te, { name: "dropdown" }, {
          default: Y(() => [
            o.value ? (n(), l("div", {
              key: 0,
              class: "fluent-select-dropdown",
              style: D(c.value)
            }, [
              (n(!0), l(O, null, j(e.options, ($) => (n(), l("button", {
                key: $.value,
                class: w(["select-option", { selected: $.value === e.modelValue }]),
                onClick: (I) => h($.value)
              }, [
                N(v.$slots, "option", { option: $ }, () => [
                  oe(k($.label), 1)
                ], !0)
              ], 10, qu))), 128))
            ], 4)) : f("", !0)
          ]),
          _: 3
        })
      ])),
      e.error ? (n(), l("div", Hu, k(e.error), 1)) : f("", !0)
    ], 512));
  }
}, Wu = /* @__PURE__ */ B(ju, [["__scopeId", "data-v-3b7b2d97"]]), Gu = {
  class: "selector-bar-items",
  role: "tablist"
}, Uu = ["aria-selected", "aria-disabled", "disabled", "onClick"], Yu = { class: "selector-bar-item-text" }, Xu = {
  __name: "FluentSelectorBar",
  props: {
    items: { type: Array, required: !0 },
    modelValue: { type: Number, default: 0 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x({
      get: () => t.modelValue,
      set: (r) => {
        a("update:modelValue", r), a("change", r);
      }
    }), i = (r) => {
      var c;
      t.disabled || (c = t.items[r]) != null && c.disabled || (o.value = r);
    };
    return (r, c) => (n(), l("div", {
      class: w(["fluent-selector-bar", { "is-disabled": e.disabled }])
    }, [
      u("div", Gu, [
        (n(!0), l(O, null, j(e.items, (d, m) => (n(), l("button", {
          key: m,
          class: w(["selector-bar-item", { "is-selected": o.value === m, "is-disabled": d.disabled }]),
          role: "tab",
          "aria-selected": o.value === m,
          "aria-disabled": d.disabled || e.disabled,
          disabled: d.disabled || e.disabled,
          onClick: (b) => i(m)
        }, [
          d.icon ? (n(), L(C, {
            key: 0,
            icon: d.icon,
            width: 16
          }, null, 8, ["icon"])) : f("", !0),
          u("span", Yu, k(d.label), 1),
          c[0] || (c[0] = u("div", { class: "selector-bar-indicator" }, null, -1))
        ], 10, Uu))), 128))
      ])
    ], 2));
  }
}, Zu = /* @__PURE__ */ B(Xu, [["__scopeId", "data-v-fdd209e6"]]), Qu = ["disabled"], Ju = { class: "item-label" }, ec = {
  __name: "FluentSelectorBarItem",
  props: {
    itemKey: { type: [String, Number], required: !0 },
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 }
  },
  setup(e) {
    const s = e, t = Ue("selectorBar"), a = x(() => (t == null ? void 0 : t.selectedKey) === s.itemKey), o = () => {
      s.disabled || t == null || t.select(s.itemKey);
    };
    return (i, r) => (n(), l("button", {
      class: w(["fluent-selector-bar-item", { "is-selected": a.value, "is-disabled": e.disabled }]),
      disabled: e.disabled,
      onClick: o
    }, [
      e.icon ? (n(), L(C, {
        key: 0,
        icon: e.icon,
        width: 16
      }, null, 8, ["icon"])) : f("", !0),
      u("span", Ju, k(e.label), 1)
    ], 10, Qu));
  }
}, tc = /* @__PURE__ */ B(ec, [["__scopeId", "data-v-851d7416"]]), nc = {
  __name: "FluentSemanticZoom",
  props: {
    modelValue: { type: Boolean, default: !0 },
    showZoomOutButton: { type: Boolean, default: !0 },
    canChangeViews: { type: Boolean, default: !0 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "view-change-started", "view-change-completed"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(!1), r = x({
      get: () => t.modelValue,
      set: (h) => {
        if (!t.canChangeViews || i.value || t.disabled) return;
        const g = {
          sourceIsZoomedInView: t.modelValue,
          targetIsZoomedInView: h
        };
        a("view-change-started", g), i.value = !0, a("update:modelValue", h), setTimeout(() => {
          i.value = !1, a("view-change-completed", {
            sourceIsZoomedInView: g.targetIsZoomedInView,
            targetIsZoomedInView: h
          });
        }, 300);
      }
    }), c = () => {
      r.value = !r.value;
    }, d = (h) => {
    }, m = (h) => {
      h.target.closest(".zoom-item-clickable") && (r.value = !0);
    }, b = (h) => {
      t.disabled || h.ctrlKey && (h.preventDefault(), h.deltaY > 0 && r.value ? r.value = !1 : h.deltaY < 0 && !r.value && (r.value = !0));
    };
    return (h, g) => (n(), l("div", {
      ref_key: "containerRef",
      ref: o,
      class: w(["fluent-semantic-zoom", { "is-zoomed-out": !r.value }])
    }, [
      e.showZoomOutButton && r.value && e.canChangeViews ? (n(), l("button", {
        key: 0,
        class: "zoom-out-button",
        onClick: c,
        "aria-label": "切换到缩略视图"
      }, [...g[0] || (g[0] = [
        u("svg", {
          width: "16",
          height: "16",
          viewBox: "0 0 16 16",
          fill: "currentColor"
        }, [
          u("path", { d: "M2 2h5v1H3v4H2V2zm7 0h5v5h-1V3H9V2zM2 14h5v-1H3v-4H2v5zm12 0h-5v-1h4v-4h1v5z" })
        ], -1)
      ])])) : f("", !0),
      F(te, { name: "zoom-fade" }, {
        default: Y(() => [
          Ce(u("div", {
            class: "zoom-view zoomed-in-view",
            onClick: d,
            onWheel: b
          }, [
            N(h.$slots, "zoomed-in", {}, void 0, !0)
          ], 544), [
            [Fe, r.value]
          ])
        ]),
        _: 3
      }),
      F(te, { name: "zoom-fade" }, {
        default: Y(() => [
          Ce(u("div", {
            class: "zoom-view zoomed-out-view",
            onClick: m
          }, [
            N(h.$slots, "zoomed-out", {}, void 0, !0)
          ], 512), [
            [Fe, !r.value]
          ])
        ]),
        _: 3
      })
    ], 2));
  }
}, lc = /* @__PURE__ */ B(nc, [["__scopeId", "data-v-80f137eb"]]), ac = { class: "settings-card-header" }, oc = {
  key: 0,
  class: "card-icon"
}, sc = { class: "card-text" }, ic = { class: "card-title" }, rc = {
  key: 0,
  class: "card-description"
}, uc = { class: "card-action" }, cc = {
  key: 0,
  class: "card-content"
}, dc = {
  __name: "FluentSettingsCard",
  props: {
    title: { type: String, required: !0 },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    clickable: { type: Boolean, default: !1 }
  },
  setup(e) {
    return (s, t) => (n(), l("div", {
      class: w(["fluent-settings-card", { "is-clickable": e.clickable }])
    }, [
      u("div", ac, [
        e.icon ? (n(), l("div", oc, [
          F(C, {
            icon: e.icon,
            width: 20
          }, null, 8, ["icon"])
        ])) : f("", !0),
        u("div", sc, [
          u("div", ic, k(e.title), 1),
          e.description ? (n(), l("div", rc, k(e.description), 1)) : f("", !0)
        ]),
        u("div", uc, [
          N(s.$slots, "action", {}, void 0, !0)
        ])
      ]),
      s.$slots.default ? (n(), l("div", cc, [
        N(s.$slots, "default", {}, void 0, !0)
      ])) : f("", !0)
    ], 2));
  }
}, fc = /* @__PURE__ */ B(dc, [["__scopeId", "data-v-44dc415c"]]), mc = {
  __name: "FluentSkeleton",
  props: {
    width: { type: [String, Number], default: "100%" },
    height: { type: [String, Number], default: "16px" },
    shape: { type: String, default: "rect" },
    // rect, circle, rounded
    animated: { type: Boolean, default: !0 }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => ({
      width: t(s.width),
      height: t(s.height)
    }));
    return (o, i) => (n(), l("div", {
      class: w(["fluent-skeleton", [`shape-${e.shape}`, { "is-animated": e.animated }]]),
      style: D(a.value)
    }, [...i[0] || (i[0] = [
      u("div", { class: "skeleton-shimmer" }, null, -1)
    ])], 6));
  }
}, vc = /* @__PURE__ */ B(mc, [["__scopeId", "data-v-6233b34a"]]), pc = {
  key: 0,
  class: "slider-label"
}, hc = { class: "slider-container" }, yc = ["min", "max", "step", "value", "disabled", "vertical"], bc = { class: "slider-track" }, gc = {
  key: 1,
  class: "slider-value"
}, kc = {
  __name: "FluentSlider",
  props: {
    modelValue: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    vertical: { type: Boolean, default: !1 },
    showValue: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x(() => t.max === t.min ? 0 : Math.max(0, Math.min(100, (t.modelValue - t.min) / (t.max - t.min) * 100))), i = x(() => t.vertical ? { height: `${o.value}%`, bottom: 0 } : { width: `${o.value}%` }), r = x(() => t.vertical ? { bottom: `${o.value}%` } : { left: `${o.value}%` }), c = (m) => {
      const b = Number(m.target.value);
      a("update:modelValue", b);
    }, d = (m) => {
      const b = Number(m.target.value);
      a("change", b);
    };
    return (m, b) => (n(), l("div", {
      class: w(["fluent-slider", { "is-disabled": e.disabled, "is-vertical": e.vertical }])
    }, [
      e.label ? (n(), l("div", pc, k(e.label), 1)) : f("", !0),
      u("div", hc, [
        u("input", {
          type: "range",
          class: "slider-input",
          min: e.min,
          max: e.max,
          step: e.step,
          value: e.modelValue,
          disabled: e.disabled,
          vertical: e.vertical,
          onInput: c,
          onChange: d
        }, null, 40, yc),
        u("div", bc, [
          u("div", {
            class: "slider-fill",
            style: D(i.value)
          }, null, 4)
        ]),
        u("div", {
          class: "slider-thumb",
          style: D(r.value)
        }, null, 4)
      ]),
      e.showValue ? (n(), l("div", gc, k(e.modelValue), 1)) : f("", !0)
    ], 2));
  }
}, $c = /* @__PURE__ */ B(kc, [["__scopeId", "data-v-b0a0c71b"]]), wc = {
  __name: "FluentSpace",
  props: {
    direction: { type: String, default: "horizontal" },
    // horizontal, vertical
    size: { type: [Number, String, Array], default: 8 },
    align: { type: String, default: "start" },
    // start, end, center, baseline
    wrap: { type: Boolean, default: !1 }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => {
      const o = {};
      return Array.isArray(s.size) ? (o.columnGap = t(s.size[0]), o.rowGap = t(s.size[1] || s.size[0])) : o.gap = t(s.size), o;
    });
    return (o, i) => (n(), l("div", {
      class: w(["fluent-space", [`direction-${e.direction}`, `align-${e.align}`, { wrap: e.wrap }]]),
      style: D(a.value)
    }, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 6));
  }
}, _c = /* @__PURE__ */ B(wc, [["__scopeId", "data-v-e3236af5"]]), Sc = ["disabled"], xc = ["disabled"], Cc = {
  key: 0,
  class: "split-button-flyout"
}, Fc = {
  key: 0,
  class: "flyout-separator"
}, Vc = ["disabled", "onClick"], Ic = { class: "flyout-item-label" }, Bc = {
  __name: "FluentSplitButton",
  props: {
    label: { type: String, default: "" },
    items: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["click", "select"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(!1), i = () => {
      t.disabled || a("click");
    }, r = () => {
      t.disabled || (o.value = !o.value);
    }, c = (m) => {
      m.disabled || (o.value = !1, a("select", m), m.click && m.click());
    }, d = (m) => {
      m.target.closest(".fluent-split-button") || (o.value = !1);
    };
    return re(() => {
      document.addEventListener("click", d);
    }), ce(() => {
      document.removeEventListener("click", d);
    }), (m, b) => (n(), l("div", {
      class: w(["fluent-split-button", { "is-open": o.value, "is-disabled": e.disabled }])
    }, [
      u("button", {
        class: "split-button-main",
        disabled: e.disabled,
        onClick: i
      }, [
        N(m.$slots, "default", {}, () => [
          oe(k(e.label), 1)
        ], !0)
      ], 8, Sc),
      b[0] || (b[0] = u("div", { class: "split-button-separator" }, null, -1)),
      u("button", {
        class: "split-button-chevron",
        disabled: e.disabled,
        onClick: r
      }, [
        F(C, {
          icon: "chevron-down-20-regular",
          width: 12
        })
      ], 8, xc),
      F(te, { name: "dropdown" }, {
        default: Y(() => [
          o.value ? (n(), l("div", Cc, [
            (n(!0), l(O, null, j(e.items, (h, g) => (n(), l(O, { key: g }, [
              h.type === "separator" ? (n(), l("div", Fc)) : (n(), l("button", {
                key: 1,
                class: w(["flyout-item", { "is-disabled": h.disabled }]),
                disabled: h.disabled,
                onClick: (y) => c(h)
              }, [
                h.icon ? (n(), L(C, {
                  key: 0,
                  icon: h.icon,
                  width: 16
                }, null, 8, ["icon"])) : f("", !0),
                u("span", Ic, k(h.label), 1)
              ], 10, Vc))
            ], 64))), 128))
          ])) : f("", !0)
        ]),
        _: 1
      })
    ], 2));
  }
}, Mc = /* @__PURE__ */ B(Bc, [["__scopeId", "data-v-c62302f2"]]), Tc = { class: "split-view-content" }, Pc = {
  __name: "FluentSplitView",
  props: {
    paneWidth: { type: [Number, String], default: 250 },
    isPaneOpen: { type: Boolean, default: !0 },
    panePlacement: { type: String, default: "left" }
    // left, right
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => ({
      width: t(s.paneWidth),
      [s.panePlacement]: 0
    }));
    return (o, i) => (n(), l("div", {
      class: w(["fluent-split-view", { "is-pane-open": e.isPaneOpen }])
    }, [
      u("div", {
        class: "split-view-pane",
        style: D(a.value)
      }, [
        N(o.$slots, "pane", {}, void 0, !0)
      ], 4),
      u("div", Tc, [
        N(o.$slots, "default", {}, void 0, !0)
      ])
    ], 2));
  }
}, Rc = /* @__PURE__ */ B(Pc, [["__scopeId", "data-v-0e2133ca"]]), Nc = {
  __name: "FluentStackPanel",
  props: {
    orientation: { type: String, default: "vertical" },
    // vertical, horizontal
    spacing: { type: Number, default: 0 },
    padding: { type: [String, Number], default: 0 },
    horizontalAlignment: { type: String, default: "stretch" },
    verticalAlignment: { type: String, default: "top" }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => ({
      gap: `${s.spacing}px`,
      padding: t(s.padding),
      alignItems: s.horizontalAlignment,
      justifyContent: s.verticalAlignment
    }));
    return (o, i) => (n(), l("div", {
      class: w(["fluent-stack-panel", [`orientation-${e.orientation}`]]),
      style: D(a.value)
    }, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 6));
  }
}, zc = /* @__PURE__ */ B(Nc, [["__scopeId", "data-v-b0c02b71"]]), Ac = { class: "fluent-statistics" }, Ec = {
  key: 0,
  class: "statistics-title"
}, Lc = { class: "value" }, Dc = {
  key: 0,
  class: "suffix"
}, Oc = {
  key: 1,
  class: "prefix"
}, Kc = {
  key: 1,
  class: "statistics-description"
}, qc = {
  __name: "FluentStatistics",
  props: {
    value: { type: [Number, String], required: !0 },
    title: { type: String, default: "" },
    prefix: { type: String, default: "" },
    suffix: { type: String, default: "" },
    description: { type: String, default: "" },
    trend: { type: String, default: "" },
    // up, down, neutral
    trendValue: { type: String, default: "" },
    precision: { type: Number, default: 0 },
    loading: { type: Boolean, default: !1 }
  },
  setup(e) {
    const s = e, t = x(() => typeof s.value == "number" ? s.value.toFixed(s.precision) : s.value), a = x(() => {
      const o = {
        up: "arrow-up-20-regular",
        down: "arrow-down-20-regular",
        neutral: "subtract-20-regular"
      };
      return o[s.trend] || o.neutral;
    });
    return (o, i) => (n(), l("div", Ac, [
      e.title ? (n(), l("div", Ec, k(e.title), 1)) : f("", !0),
      u("div", {
        class: w(["statistics-value", { "is-loading": e.loading }])
      }, [
        u("span", Lc, k(t.value), 1),
        e.suffix ? (n(), l("span", Dc, k(e.suffix), 1)) : f("", !0),
        e.prefix ? (n(), l("span", Oc, k(e.prefix), 1)) : f("", !0)
      ], 2),
      e.description ? (n(), l("div", Kc, [
        e.trend ? (n(), l("span", {
          key: 0,
          class: w(["trend", `trend-${e.trend}`])
        }, [
          F(C, {
            icon: a.value,
            width: 12
          }, null, 8, ["icon"]),
          oe(" " + k(e.trendValue), 1)
        ], 2)) : f("", !0),
        oe(" " + k(e.description), 1)
      ])) : f("", !0)
    ]));
  }
}, Hc = /* @__PURE__ */ B(qc, [["__scopeId", "data-v-37f40802"]]), jc = {
  key: 0,
  class: "swipe-actions left-actions"
}, Wc = ["onClick"], Gc = { key: 1 }, Uc = {
  key: 1,
  class: "swipe-actions right-actions"
}, Yc = ["onClick"], Xc = { key: 1 }, Zc = {
  __name: "FluentSwipeControl",
  props: {
    leftActions: { type: Array, default: () => [] },
    rightActions: { type: Array, default: () => [] },
    threshold: { type: Number, default: 80 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["action"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(0), i = _(0), r = _(!1), c = _(0), d = x(() => ({
      transform: `translateX(${c.value}px)`,
      transition: r.value ? "none" : "transform 0.3s ease"
    })), m = (y) => {
      t.disabled || (o.value = y.touches[0].clientX, r.value = !0);
    }, b = (y) => {
      if (!r.value || t.disabled) return;
      i.value = y.touches[0].clientX;
      const v = i.value - o.value, p = t.leftActions.length > 0 ? t.threshold : 0, $ = t.rightActions.length > 0 ? -t.threshold : 0;
      c.value = Math.max($, Math.min(p, v));
    }, h = () => {
      r.value && (r.value = !1, c.value >= t.threshold && t.leftActions.length > 0 ? c.value = t.threshold : c.value <= -t.threshold && t.rightActions.length > 0 ? c.value = -t.threshold : c.value = 0);
    }, g = (y) => {
      a("action", y), c.value = 0;
    };
    return (y, v) => (n(), l("div", {
      class: w(["fluent-swipe-control", { "is-swiping": r.value }]),
      style: D({ "--swipe-action-width": `${Math.max(0, e.threshold)}px` }),
      onTouchstart: m,
      onTouchmove: b,
      onTouchend: h
    }, [
      e.leftActions.length > 0 ? (n(), l("div", jc, [
        (n(!0), l(O, null, j(e.leftActions, (p) => (n(), l("button", {
          key: p.id,
          class: "swipe-action",
          style: D({ background: p.color || "var(--accent)" }),
          onClick: ($) => g(p)
        }, [
          p.icon ? (n(), L(C, {
            key: 0,
            icon: p.icon,
            width: 16
          }, null, 8, ["icon"])) : f("", !0),
          p.label ? (n(), l("span", Gc, k(p.label), 1)) : f("", !0)
        ], 12, Wc))), 128))
      ])) : f("", !0),
      u("div", {
        class: "swipe-content",
        style: D(d.value)
      }, [
        N(y.$slots, "default", {}, void 0, !0)
      ], 4),
      e.rightActions.length > 0 ? (n(), l("div", Uc, [
        (n(!0), l(O, null, j(e.rightActions, (p) => (n(), l("button", {
          key: p.id,
          class: "swipe-action",
          style: D({ background: p.color || "var(--accent)" }),
          onClick: ($) => g(p)
        }, [
          p.icon ? (n(), L(C, {
            key: 0,
            icon: p.icon,
            width: 16
          }, null, 8, ["icon"])) : f("", !0),
          p.label ? (n(), l("span", Xc, k(p.label), 1)) : f("", !0)
        ], 12, Yc))), 128))
      ])) : f("", !0)
    ], 38));
  }
}, Qc = /* @__PURE__ */ B(Zc, [["__scopeId", "data-v-67af0d26"]]), Jc = ["disabled"], ed = ["onClick"], td = { class: "tab-label" }, nd = ["onClick"], ld = ["disabled"], ad = { class: "tab-view-content" }, od = {
  __name: "FluentTabView",
  props: {
    tabs: { type: Array, required: !0 },
    modelValue: { type: Number, default: 0 },
    vertical: { type: Boolean, default: !1 },
    closable: { type: Boolean, default: !1 },
    scrollable: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "change", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(0), r = _(0), c = x(() => t.modelValue), d = x(() => t.vertical ? {} : {
      transform: `translateX(-${i.value}px)`
    }), m = x(() => t.scrollable && !t.vertical), b = (p) => {
      var $;
      ($ = t.tabs[p]) != null && $.disabled || (a("update:modelValue", p), a("change", p));
    }, h = (p) => {
      a("close", p);
    }, g = () => {
      i.value = Math.max(0, i.value - 200);
    }, y = () => {
      i.value = Math.min(r.value, i.value + 200);
    }, v = () => {
      o.value && (i.value = o.value.scrollLeft);
    };
    return J(() => t.modelValue, () => {
      if (o.value) {
        const p = o.value.querySelector(".tab-item.is-active");
        p && p.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }), (p, $) => (n(), l("div", {
      class: w(["fluent-tab-view", { "is-vertical": e.vertical }])
    }, [
      u("div", {
        class: w(["tab-view-tabs", { "is-scrollable": m.value }])
      }, [
        m.value ? (n(), l("button", {
          key: 0,
          class: "scroll-button left",
          disabled: i.value <= 0,
          onClick: g
        }, [
          F(C, {
            icon: "chevron-left-20-regular",
            width: 16
          })
        ], 8, Jc)) : f("", !0),
        u("div", {
          class: "tabs-container",
          ref_key: "tabsContainerRef",
          ref: o,
          onScroll: v
        }, [
          u("div", {
            class: "tabs-track",
            style: D(d.value)
          }, [
            (n(!0), l(O, null, j(e.tabs, (I, S) => (n(), l("button", {
              key: S,
              class: w(["tab-item", { "is-active": c.value === S, "is-disabled": I.disabled }]),
              onClick: (M) => b(S)
            }, [
              I.icon ? (n(), L(C, {
                key: 0,
                icon: I.icon,
                width: 16
              }, null, 8, ["icon"])) : f("", !0),
              u("span", td, k(I.label), 1),
              e.closable ? (n(), l("button", {
                key: 1,
                class: "tab-close",
                onClick: ee((M) => h(S), ["stop"])
              }, [
                F(C, {
                  icon: "dismiss-16-regular",
                  width: 12
                })
              ], 8, nd)) : f("", !0)
            ], 10, ed))), 128))
          ], 4)
        ], 544),
        m.value ? (n(), l("button", {
          key: 1,
          class: "scroll-button right",
          disabled: i.value >= r.value,
          onClick: y
        }, [
          F(C, {
            icon: "chevron-right-20-regular",
            width: 16
          })
        ], 8, ld)) : f("", !0)
      ], 2),
      u("div", ad, [
        N(p.$slots, "default", { activeIndex: c.value }, void 0, !0)
      ])
    ], 2));
  }
}, sd = /* @__PURE__ */ B(od, [["__scopeId", "data-v-c5cdc846"]]), id = { class: "fluent-tabs" }, rd = {
  class: "fluent-tabs-list",
  role: "tablist"
}, ud = ["aria-selected", "disabled", "onClick"], cd = {
  key: 1,
  class: "fluent-tab-symbol",
  "aria-hidden": "true"
}, dd = {
  key: 0,
  class: "fluent-tab-panel",
  role: "tabpanel"
}, fd = {
  __name: "FluentTabs",
  props: {
    modelValue: { type: [String, Number], required: !0 },
    options: { type: Array, default: () => [] },
    tabs: { type: Array, default: () => [] }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x(() => (t.tabs.length ? t.tabs : t.options).map((r) => ({
      ...r,
      value: r.value ?? r.key
    }))), i = (r) => {
      r.disabled || a("update:modelValue", r.value);
    };
    return (r, c) => (n(), l("div", id, [
      u("div", rd, [
        (n(!0), l(O, null, j(o.value, (d) => (n(), l("button", {
          key: d.value,
          class: w(["fluent-tab", { active: e.modelValue === d.value, disabled: d.disabled }]),
          type: "button",
          role: "tab",
          "aria-selected": e.modelValue === d.value,
          disabled: d.disabled,
          onClick: (m) => i(d)
        }, [
          d.icon ? (n(), L(C, {
            key: 0,
            icon: d.icon,
            width: 16
          }, null, 8, ["icon"])) : d.symbol ? (n(), l("span", cd, k(d.symbol), 1)) : f("", !0),
          u("span", null, k(d.label), 1)
        ], 10, ud))), 128))
      ]),
      r.$slots[e.modelValue] ? (n(), l("div", dd, [
        N(r.$slots, e.modelValue, {}, void 0, !0)
      ])) : f("", !0)
    ]));
  }
}, md = /* @__PURE__ */ B(fd, [["__scopeId", "data-v-e64500a5"]]), vd = {
  key: 0,
  class: "teaching-tip-icon"
}, pd = { class: "teaching-tip-content" }, hd = {
  key: 0,
  class: "teaching-tip-title"
}, yd = {
  key: 1,
  class: "teaching-tip-subtitle"
}, bd = { class: "teaching-tip-body" }, gd = {
  key: 2,
  class: "teaching-tip-actions"
}, kd = {
  __name: "FluentTeachingTip",
  props: {
    modelValue: { type: Boolean, default: void 0 },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    icon: { type: String, default: "" },
    target: { type: [String, Object], default: null },
    placement: { type: String, default: "bottom" },
    closable: { type: Boolean, default: !0 },
    closeOnEscape: { type: Boolean, default: !0 },
    closeOnOverlay: { type: Boolean, default: !0 }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = _(!1), r = x(() => t.modelValue ?? i.value), c = _({ visibility: "hidden" }), d = () => {
      const y = typeof t.target == "string" ? document.querySelector(t.target) : t.target;
      return (y == null ? void 0 : y.$el) || y;
    }, m = async () => {
      if (!r.value) return;
      await ve();
      const y = d(), v = o.value;
      if (!y || !(v != null && v.getBoundingClientRect)) return;
      const p = y.getBoundingClientRect(), $ = v.getBoundingClientRect(), I = 12;
      let S = p.bottom + I, M = p.left + (p.width - $.width) / 2;
      t.placement === "top" && (S = p.top - $.height - I), t.placement === "left" && (S = p.top + (p.height - $.height) / 2, M = p.left - $.width - I), t.placement === "right" && (S = p.top + (p.height - $.height) / 2, M = p.right + I), M = Math.max(12, Math.min(window.innerWidth - $.width - 12, M)), S = Math.max(12, Math.min(window.innerHeight - $.height - 12, S)), c.value = { top: `${S}px`, left: `${M}px`, visibility: "visible" };
    }, b = () => {
      i.value = !1, a("update:modelValue", !1), a("close");
    }, h = (y) => {
      y.key === "Escape" && t.closeOnEscape && r.value && b();
    }, g = (y) => {
      var p;
      if (!r.value || !t.closeOnOverlay) return;
      const v = d();
      !((p = o.value) != null && p.contains(y.target)) && !(v != null && v.contains(y.target)) && b();
    };
    return J(r, (y) => {
      y && (c.value = { visibility: "hidden" }, m());
    }), J(() => [t.target, t.placement], () => m()), re(() => {
      document.addEventListener("keydown", h), document.addEventListener("pointerdown", g), window.addEventListener("resize", m), window.addEventListener("scroll", m, !0);
    }), ce(() => {
      document.removeEventListener("keydown", h), document.removeEventListener("pointerdown", g), window.removeEventListener("resize", m), window.removeEventListener("scroll", m, !0);
    }), (y, v) => (n(), L(fe, { to: "body" }, [
      F(te, { name: "teaching-tip" }, {
        default: Y(() => [
          r.value ? (n(), l("div", {
            key: 0,
            ref_key: "tipRef",
            ref: o,
            class: w(["fluent-teaching-tip", [`placement-${e.placement}`]]),
            style: D(c.value),
            role: "dialog"
          }, [
            e.icon ? (n(), l("div", vd, [
              F(C, {
                icon: e.icon,
                width: 24
              }, null, 8, ["icon"])
            ])) : f("", !0),
            u("div", pd, [
              e.title ? (n(), l("h3", hd, k(e.title), 1)) : f("", !0),
              e.subtitle ? (n(), l("p", yd, k(e.subtitle), 1)) : f("", !0),
              u("div", bd, [
                N(y.$slots, "default", {}, void 0, !0)
              ])
            ]),
            e.closable ? (n(), l("button", {
              key: 1,
              class: "teaching-tip-close",
              onClick: b
            }, [
              F(C, {
                icon: "dismiss-16-regular",
                width: 16
              })
            ])) : f("", !0),
            y.$slots.actions ? (n(), l("div", gd, [
              N(y.$slots, "actions", {}, void 0, !0)
            ])) : f("", !0)
          ], 6)) : f("", !0)
        ]),
        _: 3
      })
    ]));
  }
}, $d = /* @__PURE__ */ B(kd, [["__scopeId", "data-v-396c18d9"]]), wd = {
  key: 0,
  class: "text-box-label"
}, _d = { class: "text-box-container" }, Sd = {
  key: 0,
  class: "text-box-prefix"
}, xd = ["type", "value", "placeholder", "disabled", "readonly", "maxlength"], Cd = {
  key: 1,
  class: "text-box-suffix"
}, Fd = {
  key: 1,
  class: "text-box-error"
}, Vd = {
  key: 2,
  class: "text-box-description"
}, Id = {
  __name: "FluentTextBox",
  props: {
    modelValue: { type: [String, Number], default: "" },
    type: { type: String, default: "text" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    prefix: { type: String, default: "" },
    suffix: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 },
    readonly: { type: Boolean, default: !1 },
    clearable: { type: Boolean, default: !1 },
    maxLength: { type: Number, default: void 0 },
    error: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change", "focus", "blur", "keydown", "clear"],
  setup(e, { expose: s, emit: t }) {
    const a = t, o = _(null), i = _(!1), r = (v) => {
      a("update:modelValue", v.target.value);
    }, c = (v) => {
      a("change", v.target.value);
    }, d = (v) => {
      i.value = !0, a("focus", v);
    }, m = (v) => {
      i.value = !1, a("blur", v);
    }, b = (v) => {
      a("keydown", v);
    }, h = () => {
      var v;
      a("update:modelValue", ""), a("change", ""), a("clear"), (v = o.value) == null || v.focus();
    };
    return s({ focus: () => {
      var v;
      (v = o.value) == null || v.focus();
    }, blur: () => {
      var v;
      (v = o.value) == null || v.blur();
    } }), (v, p) => (n(), l("div", {
      class: w(["fluent-text-box", { "is-disabled": e.disabled, "is-focused": i.value }])
    }, [
      e.label ? (n(), l("div", wd, k(e.label), 1)) : f("", !0),
      u("div", _d, [
        e.prefix || v.$slots.prefix ? (n(), l("div", Sd, [
          N(v.$slots, "prefix", {}, () => [
            oe(k(e.prefix), 1)
          ], !0)
        ])) : f("", !0),
        u("input", {
          ref_key: "inputRef",
          ref: o,
          type: e.type,
          class: "text-box-input",
          value: e.modelValue,
          placeholder: e.placeholder,
          disabled: e.disabled,
          readonly: e.readonly,
          maxlength: e.maxLength,
          onInput: r,
          onChange: c,
          onFocus: d,
          onBlur: m,
          onKeydown: b
        }, null, 40, xd),
        e.suffix || v.$slots.suffix ? (n(), l("div", Cd, [
          N(v.$slots, "suffix", {}, () => [
            oe(k(e.suffix), 1)
          ], !0)
        ])) : f("", !0),
        e.clearable && e.modelValue ? (n(), l("button", {
          key: 2,
          class: "text-box-clear",
          onClick: h
        }, [
          F(C, {
            icon: "dismiss-16-regular",
            width: 12
          })
        ])) : f("", !0)
      ]),
      e.error ? (n(), l("div", Fd, k(e.error), 1)) : f("", !0),
      e.description ? (n(), l("div", Vd, k(e.description), 1)) : f("", !0)
    ], 2));
  }
}, Bd = /* @__PURE__ */ B(Id, [["__scopeId", "data-v-39bb8ddd"]]), Md = {
  __name: "FluentTextBlock",
  props: {
    text: { type: [String, Number], default: "" },
    size: { type: String, default: "body" },
    weight: { type: String, default: "regular" },
    color: { type: String, default: "" },
    align: { type: String, default: "left" },
    wrap: { type: Boolean, default: !1 },
    selectable: { type: Boolean, default: !1 },
    maxLines: { type: Number, default: 0 }
  },
  setup(e) {
    const s = e, t = x(() => ({
      caption: "size-caption",
      body: "size-body",
      "body-large": "size-body-large",
      subtitle: "size-subtitle",
      title: "size-title",
      "title-large": "size-title-large",
      display: "size-display"
    })[s.size] || "size-body"), a = x(() => ({
      light: "weight-light",
      regular: "weight-regular",
      semibold: "weight-semibold",
      bold: "weight-bold"
    })[s.weight] || "weight-regular"), o = x(() => {
      const i = {};
      return s.color && (i.color = s.color), s.align && (i.textAlign = s.align), s.wrap && (i.whiteSpace = "normal", i.wordBreak = "break-word"), s.maxLines > 0 && (i.display = "-webkit-box", i.webkitLineClamp = s.maxLines, i.webkitBoxOrient = "vertical", i.overflow = "hidden"), i;
    });
    return (i, r) => (n(), l("span", {
      class: w(["fluent-text-block", [t.value, a.value, { "is-selectable": e.selectable }]]),
      style: D(o.value)
    }, [
      N(i.$slots, "default", {}, () => [
        oe(k(e.text), 1)
      ], !0)
    ], 6));
  }
}, Td = /* @__PURE__ */ B(Md, [["__scopeId", "data-v-1804074f"]]), Pd = {
  __name: "FluentTheme",
  props: {
    theme: { type: String, default: "system" },
    material: { type: String, default: "acrylic" },
    accentColor: { type: String, default: "" },
    locale: { type: String, default: "zh-CN" }
  },
  emits: ["theme-change", "material-change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x(() => t.theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : t.theme), i = x(() => ({
      [`theme-${o.value}`]: !0,
      [`material-${t.material}`]: !0
    })), r = x(() => {
      const c = {};
      switch (t.accentColor && (c["--fluent-accent"] = t.accentColor === "system" ? "AccentColor" : t.accentColor), t.material) {
        case "acrylic":
          c["--bg-material"] = "var(--bg-acrylic)", c["--material-blur"] = "30px";
          break;
        case "mica":
          c["--bg-material"] = "var(--bg-mica)", c["--material-blur"] = "0px";
          break;
        case "mica-alt":
          c["--bg-material"] = "var(--bg-mica-alt)", c["--material-blur"] = "0px";
          break;
        default:
          c["--bg-material"] = "var(--bg-card)", c["--material-blur"] = "0px";
      }
      return c;
    });
    return ze("theme", o), ze("material", x(() => t.material)), ze("locale", x(() => t.locale)), t.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      a("theme-change", o.value);
    }), (c, d) => (n(), l("div", {
      class: w(["fluent-theme", i.value]),
      style: D(r.value)
    }, [
      N(c.$slots, "default", {}, void 0, !0)
    ], 6));
  }
}, Rd = /* @__PURE__ */ B(Pd, [["__scopeId", "data-v-0c02656e"]]), Nd = {
  key: 0,
  class: "time-picker-label"
}, zd = ["value", "disabled", "placeholder"], Ad = ["disabled"], Ed = {
  key: 1,
  class: "time-picker-error"
}, Ld = {
  __name: "FluentTimePicker",
  props: {
    modelValue: { type: String, default: "" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "选择时间" },
    disabled: { type: Boolean, default: !1 },
    error: { type: String, default: "" }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = _(null), i = () => {
      if (!(t.disabled || !o.value)) {
        o.value.focus();
        try {
          typeof o.value.showPicker == "function" ? o.value.showPicker() : o.value.click();
        } catch {
        }
      }
    }, r = (d) => {
      a("update:modelValue", d.target.value);
    }, c = (d) => {
      a("change", d.target.value);
    };
    return (d, m) => (n(), l("div", {
      class: w(["fluent-time-picker", { "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("div", Nd, k(e.label), 1)) : f("", !0),
      u("div", {
        class: "time-picker-container",
        onClick: i
      }, [
        u("input", {
          ref_key: "inputRef",
          ref: o,
          type: "time",
          class: "time-picker-input",
          value: e.modelValue,
          disabled: e.disabled,
          placeholder: e.placeholder,
          onInput: r,
          onChange: c
        }, null, 40, zd),
        u("button", {
          type: "button",
          class: "time-picker-button",
          disabled: e.disabled,
          "aria-label": "打开时间选择器",
          onClick: ee(i, ["stop"])
        }, [
          F(C, {
            icon: "clock-16-regular",
            width: 16
          })
        ], 8, Ad)
      ]),
      e.error ? (n(), l("div", Ed, k(e.error), 1)) : f("", !0)
    ], 2));
  }
}, Dd = /* @__PURE__ */ B(Ld, [["__scopeId", "data-v-883edf4c"]]), Od = { class: "timeline-indicator" }, Kd = { class: "timeline-dot" }, qd = {
  key: 0,
  class: "timeline-line"
}, Hd = { class: "timeline-content" }, jd = {
  key: 0,
  class: "timeline-title"
}, Wd = {
  key: 1,
  class: "timeline-description"
}, Gd = {
  key: 2,
  class: "timeline-time"
}, Ud = {
  __name: "FluentTimeline",
  props: {
    items: { type: Array, required: !0 },
    position: { type: String, default: "left" }
    // left, alternate
  },
  setup(e) {
    return (s, t) => (n(), l("div", {
      class: w(["fluent-timeline", [`position-${e.position}`]])
    }, [
      (n(!0), l(O, null, j(e.items, (a, o) => (n(), l("div", {
        key: o,
        class: w(["timeline-item", [`color-${a.color || "default"}`]])
      }, [
        u("div", Od, [
          u("div", Kd, [
            a.icon ? (n(), L(C, {
              key: 0,
              icon: a.icon,
              width: 12
            }, null, 8, ["icon"])) : f("", !0)
          ]),
          o < e.items.length - 1 ? (n(), l("div", qd)) : f("", !0)
        ]),
        u("div", Hd, [
          a.title ? (n(), l("div", jd, k(a.title), 1)) : f("", !0),
          a.description ? (n(), l("div", Wd, k(a.description), 1)) : f("", !0),
          a.time ? (n(), l("div", Gd, k(a.time), 1)) : f("", !0),
          N(s.$slots, `item-${o}`, { item: a }, void 0, !0)
        ])
      ], 2))), 128))
    ], 2));
  }
}, Yd = /* @__PURE__ */ B(Ud, [["__scopeId", "data-v-1fa17148"]]), Xd = {
  key: 0,
  class: "title-bar-drag-region"
}, Zd = { class: "title-bar-content" }, Qd = {
  key: 1,
  class: "title-bar-controls"
}, Jd = {
  __name: "FluentTitleBar",
  props: {
    draggable: { type: Boolean, default: !0 },
    showWindowControls: { type: Boolean, default: !1 }
  },
  emits: ["minimize", "maximize", "close"],
  setup(e) {
    return (s, t) => (n(), l("div", {
      class: w(["fluent-title-bar", { "is-draggable": e.draggable }])
    }, [
      e.draggable ? (n(), l("div", Xd)) : f("", !0),
      u("div", Zd, [
        N(s.$slots, "default", {}, void 0, !0)
      ]),
      e.showWindowControls ? (n(), l("div", Qd, [
        u("button", {
          class: "title-bar-button minimize",
          onClick: t[0] || (t[0] = (a) => s.$emit("minimize"))
        }, [
          F(C, {
            icon: "subtract-16-regular",
            width: 16
          })
        ]),
        u("button", {
          class: "title-bar-button maximize",
          onClick: t[1] || (t[1] = (a) => s.$emit("maximize"))
        }, [
          F(C, {
            icon: "maximize-16-regular",
            width: 16
          })
        ]),
        u("button", {
          class: "title-bar-button close",
          onClick: t[2] || (t[2] = (a) => s.$emit("close"))
        }, [
          F(C, {
            icon: "dismiss-16-regular",
            width: 16
          })
        ])
      ])) : f("", !0)
    ], 2));
  }
}, ef = /* @__PURE__ */ B(Jd, [["__scopeId", "data-v-a29baf1a"]]), tf = { class: "toast-icon" }, nf = { class: "toast-body" }, lf = { class: "toast-title" }, af = {
  key: 0,
  class: "toast-msg"
}, of = { class: "toast-actions" }, sf = ["onClick"], rf = ["onClick"], uf = {
  __name: "FluentToast",
  setup(e, { expose: s }) {
    const t = _([]);
    let a = 0;
    function o({ title: r, message: c, duration: d = 1e4, action: m }) {
      const b = a++;
      return t.value.push({ id: b, title: r, message: c, duration: d, action: m }), d > 0 && setTimeout(() => i(b), d), b;
    }
    function i(r) {
      const c = t.value.findIndex((d) => d.id === r);
      c !== -1 && t.value.splice(c, 1);
    }
    return s({ add: o, remove: i }), (r, c) => (n(), L(fe, { to: "body" }, [
      F(kt, {
        name: "toast",
        tag: "div",
        class: "fluent-toast-container"
      }, {
        default: Y(() => [
          (n(!0), l(O, null, j(t.value, (d) => (n(), l("div", {
            key: d.id,
            class: "fluent-toast"
          }, [
            u("div", tf, [
              F(C, {
                icon: "info-16-regular",
                width: 16
              })
            ]),
            u("div", nf, [
              u("p", lf, k(d.title), 1),
              d.message ? (n(), l("p", af, k(d.message), 1)) : f("", !0)
            ]),
            u("div", of, [
              d.action ? (n(), l("button", {
                key: 0,
                class: "toast-action-btn",
                onClick: (m) => {
                  d.action.fn(), i(d.id);
                }
              }, k(d.action.label), 9, sf)) : f("", !0),
              u("button", {
                class: "toast-close",
                onClick: (m) => i(d.id)
              }, [
                F(C, {
                  icon: "dismiss-16-regular",
                  width: 14
                })
              ], 8, rf)
            ]),
            u("div", {
              class: "toast-timer",
              style: D({ animationDuration: (d.duration || 1e4) + "ms" })
            }, null, 4)
          ]))), 128))
        ]),
        _: 1
      })
    ]));
  }
}, cf = /* @__PURE__ */ B(uf, [["__scopeId", "data-v-a50a9488"]]), df = {
  key: 0,
  class: "toggle-label"
}, ff = ["checked", "disabled"], mf = {
  __name: "FluentToggle",
  props: {
    modelValue: { type: Boolean, default: !1 },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue"],
  setup(e) {
    return (s, t) => (n(), l("label", {
      class: w(["fluent-toggle", { checked: e.modelValue, disabled: e.disabled }])
    }, [
      e.label || s.$slots.label ? (n(), l("span", df, [
        N(s.$slots, "label", {}, () => [
          oe(k(e.label), 1)
        ], !0)
      ])) : f("", !0),
      u("input", {
        type: "checkbox",
        checked: e.modelValue,
        disabled: e.disabled,
        onChange: t[0] || (t[0] = (a) => s.$emit("update:modelValue", a.target.checked))
      }, null, 40, ff),
      t[1] || (t[1] = u("span", { class: "toggle-track" }, [
        u("span", { class: "toggle-thumb" })
      ], -1))
    ], 2));
  }
}, vf = /* @__PURE__ */ B(mf, [["__scopeId", "data-v-a3b6dcc7"]]), pf = ["disabled"], hf = {
  key: 0,
  class: "toggle-button-icon"
}, yf = {
  key: 1,
  class: "toggle-button-content"
}, bf = {
  __name: "FluentToggleButton",
  props: {
    modelValue: { type: Boolean, default: void 0 },
    checked: { type: Boolean, default: void 0 },
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
    variant: { type: String, default: "secondary" },
    // primary, secondary, subtle
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "update:checked", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = x(() => t.modelValue ?? t.checked ?? !1), i = () => {
      if (t.disabled) return;
      const r = !o.value;
      a("update:modelValue", r), a("update:checked", r), a("change", r);
    };
    return (r, c) => (n(), l("button", {
      class: w(["fluent-toggle-button", {
        "is-checked": o.value,
        "is-disabled": e.disabled,
        [`variant-${e.variant}`]: !0
      }]),
      disabled: e.disabled,
      onClick: i
    }, [
      r.$slots.icon || e.icon ? (n(), l("span", hf, [
        N(r.$slots, "icon", {}, () => [
          e.icon ? (n(), L(C, {
            key: 0,
            icon: e.icon,
            width: 16
          }, null, 8, ["icon"])) : f("", !0)
        ], !0)
      ])) : f("", !0),
      r.$slots.default || e.label ? (n(), l("span", yf, [
        N(r.$slots, "default", {}, () => [
          oe(k(e.label), 1)
        ], !0)
      ])) : f("", !0)
    ], 10, pf));
  }
}, gf = /* @__PURE__ */ B(bf, [["__scopeId", "data-v-52ef537a"]]), kf = ["aria-checked", "disabled"], $f = {
  __name: "FluentToggleSwitch",
  props: {
    modelValue: { type: Boolean, default: !1 },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "change"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = `toggle-switch-${Math.random().toString(36).substr(2, 9)}`, i = x(() => t.modelValue), r = () => {
      if (t.disabled) return;
      const c = !i.value;
      a("update:modelValue", c), a("change", c);
    };
    return (c, d) => (n(), l("div", {
      class: w(["fluent-toggle-switch", { "is-checked": i.value, "is-disabled": e.disabled }])
    }, [
      e.label ? (n(), l("label", {
        key: 0,
        class: "toggle-switch-label",
        for: o
      }, k(e.label), 1)) : f("", !0),
      u("button", {
        id: o,
        class: "toggle-switch-track",
        role: "switch",
        "aria-checked": i.value,
        disabled: e.disabled,
        onClick: r
      }, [...d[0] || (d[0] = [
        u("span", { class: "toggle-switch-thumb" }, null, -1)
      ])], 8, kf)
    ], 2));
  }
}, wf = /* @__PURE__ */ B($f, [["__scopeId", "data-v-0e17a824"]]), _f = { class: "tooltip-text" }, Sf = {
  __name: "FluentTooltip",
  props: {
    content: { type: String, default: "" },
    placement: { type: String, default: "top" },
    disabled: { type: Boolean, default: !1 },
    delay: { type: Number, default: 300 }
  },
  setup(e) {
    const s = e, t = _(!1);
    let a = null, o = null;
    const i = x(() => ({})), r = () => {
      s.disabled || (clearTimeout(o), a = setTimeout(() => {
        t.value = !0;
      }, s.delay));
    }, c = () => {
      clearTimeout(a), o = setTimeout(() => {
        t.value = !1;
      }, 100);
    };
    return (d, m) => (n(), l("div", {
      class: "fluent-tooltip-wrapper",
      onMouseenter: r,
      onMouseleave: c
    }, [
      N(d.$slots, "default", {}, void 0, !0),
      F(te, { name: "tooltip" }, {
        default: Y(() => [
          t.value ? (n(), l("div", {
            key: 0,
            class: w(["fluent-tooltip", [`placement-${e.placement}`]]),
            style: D(i.value)
          }, [
            N(d.$slots, "content", {}, () => [
              u("span", _f, k(e.content), 1)
            ], !0)
          ], 6)) : f("", !0)
        ]),
        _: 3
      })
    ], 32));
  }
}, xf = /* @__PURE__ */ B(Sf, [["__scopeId", "data-v-d58d9761"]]), Cf = { class: "fluent-tree-view" }, Ff = ["onClick"], Vf = ["onClick"], If = {
  key: 1,
  class: "tree-node-spacer"
}, Bf = {
  key: 2,
  class: "tree-node-icon"
}, Mf = { class: "tree-node-label" }, Tf = {
  key: 0,
  class: "tree-node-children"
}, Pf = {
  __name: "FluentTreeView",
  props: {
    items: { type: Array, required: !0 },
    level: { type: Number, default: 0 },
    selectedId: { type: [String, Number], default: null },
    expandedIds: { type: Array, default: () => [] }
  },
  emits: ["select", "expand", "collapse"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = (r) => {
      a("select", r);
    }, i = (r) => {
      t.expandedIds.includes(r) ? a("collapse", r) : a("expand", r);
    };
    return (r, c) => {
      const d = Ae("FluentTreeView", !0);
      return n(), l("div", Cf, [
        (n(!0), l(O, null, j(e.items, (m) => (n(), l("div", {
          key: m.id,
          class: w(["tree-node", { "is-selected": e.selectedId === m.id }])
        }, [
          u("div", {
            class: "tree-node-content",
            style: D({ paddingLeft: `${e.level * 20 + 8}px` }),
            onClick: (b) => o(m)
          }, [
            m.children && m.children.length > 0 ? (n(), l("span", {
              key: 0,
              class: w(["tree-node-chevron", { "is-expanded": e.expandedIds.includes(m.id) }]),
              onClick: ee((b) => i(m.id), ["stop"])
            }, [
              F(C, {
                icon: "chevron-right-20-regular",
                width: 12
              })
            ], 10, Vf)) : (n(), l("span", If)),
            m.icon ? (n(), l("span", Bf, [
              F(C, {
                icon: m.icon,
                width: 16
              }, null, 8, ["icon"])
            ])) : f("", !0),
            u("span", Mf, k(m.label), 1)
          ], 12, Ff),
          F(te, { name: "expand" }, {
            default: Y(() => [
              m.children && e.expandedIds.includes(m.id) ? (n(), l("div", Tf, [
                F(d, {
                  items: m.children,
                  level: e.level + 1,
                  "selected-id": e.selectedId,
                  "expanded-ids": e.expandedIds,
                  onSelect: c[0] || (c[0] = (b) => r.$emit("select", b)),
                  onExpand: c[1] || (c[1] = (b) => r.$emit("expand", b)),
                  onCollapse: c[2] || (c[2] = (b) => r.$emit("collapse", b))
                }, null, 8, ["items", "level", "selected-id", "expanded-ids"])
              ])) : f("", !0)
            ]),
            _: 2
          }, 1024)
        ], 2))), 128))
      ]);
    };
  }
}, Rf = /* @__PURE__ */ B(Pf, [["__scopeId", "data-v-115534ba"]]), Nf = {
  __name: "FluentVariableSizedWrapGrid",
  props: {
    itemWidth: { type: Number, default: 100 },
    itemHeight: { type: Number, default: 100 },
    orientation: { type: String, default: "horizontal" },
    // horizontal, vertical
    horizontalChildrenAlignment: { type: String, default: "left" },
    verticalChildrenAlignment: { type: String, default: "top" },
    padding: { type: [String, Number], default: 0 }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => ({
      display: "flex",
      flexWrap: "wrap",
      flexDirection: s.orientation === "horizontal" ? "row" : "column",
      padding: t(s.padding),
      gap: "8px"
    }));
    return (o, i) => (n(), l("div", {
      class: "fluent-variable-sized-wrap-grid",
      style: D(a.value)
    }, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}, zf = /* @__PURE__ */ B(Nf, [["__scopeId", "data-v-05d3566c"]]), Af = {
  __name: "FluentViewbox",
  props: {
    stretch: { type: String, default: "uniform" },
    // none, fill, uniform, uniformToFill
    width: { type: [Number, String], default: "auto" },
    height: { type: [Number, String], default: "auto" }
  },
  setup(e) {
    const s = e, t = (o) => typeof o == "number" ? `${o}px` : o, a = x(() => ({
      width: t(s.width),
      height: t(s.height),
      overflow: "hidden"
    }));
    return (o, i) => (n(), l("div", {
      class: "fluent-viewbox",
      style: D(a.value)
    }, [
      N(o.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}, Ef = /* @__PURE__ */ B(Af, [["__scopeId", "data-v-2143f32f"]]), Lf = {
  class: "fluent-watermark",
  ref: "containerRef"
}, Df = {
  __name: "FluentWatermark",
  props: {
    text: { type: String, default: "" },
    font: { type: String, default: "16px Segoe UI" },
    color: { type: String, default: "rgba(0, 0, 0, 0.1)" },
    rotate: { type: Number, default: -22 },
    gap: { type: Array, default: () => [100, 100] },
    offset: { type: Array, default: () => [0, 0] }
  },
  setup(e) {
    const s = e, t = x(() => {
      const a = document.createElement("canvas"), o = a.getContext("2d"), i = s.text;
      o.font = s.font;
      const c = o.measureText(i).width, d = 20, m = s.gap[0], b = s.gap[1];
      return a.width = c + m, a.height = d + b, o.translate(a.width / 2, a.height / 2), o.rotate(s.rotate * Math.PI / 180), o.font = s.font, o.fillStyle = s.color, o.textAlign = "center", o.textBaseline = "middle", o.fillText(i, 0, 0), {
        backgroundImage: `url(${a.toDataURL()})`,
        backgroundSize: `${a.width}px ${a.height}px`,
        backgroundPosition: `${s.offset[0]}px ${s.offset[1]}px`
      };
    });
    return (a, o) => (n(), l("div", Lf, [
      N(a.$slots, "default", {}, void 0, !0),
      u("div", {
        class: "watermark-overlay",
        style: D(t.value)
      }, null, 4)
    ], 512));
  }
}, Of = /* @__PURE__ */ B(Df, [["__scopeId", "data-v-ab3ce32f"]]), Kf = ["title"], qf = {
  __name: "FullscreenToggle",
  setup(e) {
    const s = _(!1);
    function t() {
      document.fullscreenElement ? document.exitFullscreen().catch(() => {
      }) : document.documentElement.requestFullscreen().catch(() => {
      });
    }
    function a() {
      s.value = !!document.fullscreenElement;
    }
    return re(() => document.addEventListener("fullscreenchange", a)), Ee(() => document.removeEventListener("fullscreenchange", a)), (o, i) => (n(), l("button", {
      class: "fluent-fullscreen-toggle",
      onClick: t,
      title: s.value ? "退出全屏" : "全屏"
    }, [
      F(C, {
        icon: s.value ? "full-screen-minimize-20-regular" : "full-screen-maximize-20-regular",
        width: 16
      }, null, 8, ["icon"])
    ], 8, Kf));
  }
}, Hf = /* @__PURE__ */ B(qf, [["__scopeId", "data-v-31971dd4"]]), jf = ["aria-hidden"], Wf = { class: "secondary-sidebar-menu__header" }, Gf = { class: "secondary-sidebar-menu__brand" }, Uf = ["src"], Yf = { key: 1 }, Xf = ["aria-label", "title"], Zf = { class: "secondary-sidebar-menu__back-label" }, Qf = { class: "secondary-sidebar-menu__list" }, Jf = {
  key: 0,
  class: "secondary-sidebar-menu__group"
}, em = ["onClick"], tm = { class: "secondary-sidebar-menu__item-label" }, nm = {
  key: 0,
  class: "secondary-sidebar-menu__children"
}, lm = {
  key: 0,
  class: "secondary-sidebar-menu__group"
}, am = ["onClick"], om = { class: "secondary-sidebar-menu__item-label" }, sm = {
  key: 0,
  class: "secondary-sidebar-menu__children"
}, im = { class: "secondary-sidebar-menu__item-label" }, rm = { class: "secondary-sidebar-menu__item-label" }, um = { class: "secondary-sidebar-menu__item-label" }, cm = {
  __name: "SecondarySidebarMenu",
  props: {
    open: { type: Boolean, default: !1 },
    collapsed: { type: Boolean, default: !1 },
    items: { type: Array, required: !0 },
    backLabel: { type: String, default: "Back" },
    initialRoute: { type: [String, Object], default: null },
    navigateOnOpen: { type: Boolean, default: !1 },
    logoSrc: { type: String, default: "" },
    brandTitle: { type: String, default: "Vue Fluent Widgets" }
  },
  emits: ["back", "toggle-collapse", "navigate"],
  setup(e, { emit: s }) {
    const t = e, a = s, o = Ye(), i = wt(), r = _(null), c = _(t.open), d = _(/* @__PURE__ */ new Set()), m = () => {
      var z;
      const R = (z = window.history.state) == null ? void 0 : z.back;
      typeof R == "string" && R.startsWith("/") ? i.back() : i.push("/");
    }, b = (R) => R ? i.resolve(R).path : "", h = (R, z) => {
      if (!z.to) return !1;
      const K = b(z.to);
      return R === K || R.startsWith(`${K}/`) || K === "/docs/components" && R.startsWith("/docs/component/");
    }, g = (R, z = t.items) => {
      for (const K of z) {
        if (h(R, K)) return K;
        if (K.children) {
          const E = g(R, K.children);
          if (E) return E;
        }
      }
      return null;
    }, y = (R) => {
      var K;
      const z = o.path;
      return h(z, R) ? !0 : ((K = R.children) == null ? void 0 : K.some((E) => y(E))) || !1;
    }, v = (R) => d.value.has(R), p = (R) => {
      d.value.has(R) ? d.value.delete(R) : d.value.add(R);
    }, $ = (R, z) => {
      z.disabled ? R.preventDefault() : a("navigate", z);
    }, I = (R) => {
      for (const z of R)
        if (!z.disabled) {
          if (z.to) return z;
          if (z.children) {
            const K = I(z.children);
            if (K) return K;
          }
        }
      return null;
    }, S = () => {
      const R = b(t.initialRoute);
      return R && g(R) || g(o.path) || I(t.items);
    }, M = () => {
      const R = (z, K = []) => {
        for (const E of z) {
          if (E.to && y(E))
            return K.forEach((U) => d.value.add(U)), !0;
          if (E.children && R(E.children, [...K, E.id]))
            return !0;
        }
        return !1;
      };
      R(t.items);
    }, P = () => {
      a("back");
    };
    return J(() => t.open, async (R) => {
      if (c.value = R, R && (M(), t.navigateOnOpen)) {
        const z = S();
        z && !h(o.path, z) && await i.push(z.to);
      }
    }, { immediate: !0 }), J(() => o.path, () => {
      M();
    }), (R, z) => {
      const K = Ae("router-link");
      return n(), l("aside", {
        ref_key: "menuRef",
        ref: r,
        class: w(["secondary-sidebar-menu", {
          "is-visible": c.value,
          "is-interactive": e.open,
          "is-collapsed": e.collapsed
        }]),
        "aria-hidden": !e.open,
        onKeydown: ye(P, ["esc"])
      }, [
        u("header", Wf, [
          u("button", {
            type: "button",
            class: "secondary-sidebar-menu__back secondary-sidebar-menu__hamburger",
            "aria-label": "折叠或展开导航",
            title: "折叠或展开导航",
            onClick: z[0] || (z[0] = (E) => a("toggle-collapse"))
          }, [
            F(C, {
              icon: "line-horizontal-3-20-regular",
              width: 18
            })
          ]),
          u("button", {
            type: "button",
            class: "secondary-sidebar-menu__back secondary-sidebar-menu__history-back",
            "aria-label": "返回上一个页面",
            title: "返回上一个页面",
            onClick: m
          }, [
            F(C, {
              icon: "arrow-left-20-regular",
              width: 18
            })
          ]),
          u("div", Gf, [
            e.logoSrc && !e.collapsed ? (n(), l("img", {
              key: 0,
              src: e.logoSrc,
              alt: ""
            }, null, 8, Uf)) : f("", !0),
            e.collapsed ? f("", !0) : (n(), l("span", Yf, k(e.brandTitle), 1))
          ])
        ]),
        u("button", {
          type: "button",
          class: "secondary-sidebar-menu__back secondary-sidebar-menu__main-back",
          "aria-label": e.backLabel,
          title: e.backLabel,
          onClick: P
        }, [
          F(C, {
            icon: "panel-left-20-regular",
            width: 18
          }),
          u("span", Zf, k(e.backLabel), 1)
        ], 8, Xf),
        u("nav", Qf, [
          (n(!0), l(O, null, j(e.items, (E) => (n(), l(O, {
            key: E.id
          }, [
            E.children && E.children.length > 0 ? (n(), l("div", Jf, [
              u("button", {
                class: w(["secondary-sidebar-menu__item secondary-sidebar-menu__parent", { active: y(E), expanded: v(E.id) }]),
                onClick: (U) => p(E.id)
              }, [
                E.icon ? (n(), L(C, {
                  key: 0,
                  icon: E.icon,
                  width: 18
                }, null, 8, ["icon"])) : f("", !0),
                u("span", tm, k(E.label), 1),
                F(C, {
                  icon: "chevron-down-20-regular",
                  width: 16,
                  class: w(["secondary-sidebar-menu__chevron", { rotated: v(E.id) }])
                }, null, 8, ["class"])
              ], 10, em),
              F(te, { name: "expand" }, {
                default: Y(() => [
                  v(E.id) ? (n(), l("div", nm, [
                    (n(!0), l(O, null, j(E.children, (U) => (n(), l(O, {
                      key: U.id
                    }, [
                      U.children && U.children.length > 0 ? (n(), l("div", lm, [
                        u("button", {
                          class: w(["secondary-sidebar-menu__item secondary-sidebar-menu__parent", { active: y(U), expanded: v(U.id) }]),
                          onClick: (G) => p(U.id)
                        }, [
                          U.icon ? (n(), L(C, {
                            key: 0,
                            icon: U.icon,
                            width: 18
                          }, null, 8, ["icon"])) : f("", !0),
                          u("span", om, k(U.label), 1),
                          F(C, {
                            icon: "chevron-down-20-regular",
                            width: 16,
                            class: w(["secondary-sidebar-menu__chevron", { rotated: v(U.id) }])
                          }, null, 8, ["class"])
                        ], 10, am),
                        F(te, { name: "expand" }, {
                          default: Y(() => [
                            v(U.id) ? (n(), l("div", sm, [
                              (n(!0), l(O, null, j(U.children, (G) => (n(), L(K, {
                                key: G.id,
                                to: G.to,
                                class: w(["secondary-sidebar-menu__item", { active: y(G), disabled: G.disabled }]),
                                "aria-disabled": G.disabled || void 0,
                                onClick: (H) => $(H, G)
                              }, {
                                default: Y(() => [
                                  G.icon ? (n(), L(C, {
                                    key: 0,
                                    icon: G.icon,
                                    width: 18
                                  }, null, 8, ["icon"])) : f("", !0),
                                  u("span", im, k(G.label), 1)
                                ]),
                                _: 2
                              }, 1032, ["to", "class", "aria-disabled", "onClick"]))), 128))
                            ])) : f("", !0)
                          ]),
                          _: 2
                        }, 1024)
                      ])) : (n(), L(K, {
                        key: 1,
                        to: U.to,
                        class: w(["secondary-sidebar-menu__item", { active: y(U), disabled: U.disabled }]),
                        "aria-disabled": U.disabled || void 0,
                        onClick: (G) => $(G, U)
                      }, {
                        default: Y(() => [
                          U.icon ? (n(), L(C, {
                            key: 0,
                            icon: U.icon,
                            width: 18
                          }, null, 8, ["icon"])) : f("", !0),
                          u("span", rm, k(U.label), 1)
                        ]),
                        _: 2
                      }, 1032, ["to", "class", "aria-disabled", "onClick"]))
                    ], 64))), 128))
                  ])) : f("", !0)
                ]),
                _: 2
              }, 1024)
            ])) : (n(), L(K, {
              key: 1,
              to: E.to,
              class: w(["secondary-sidebar-menu__item", { active: y(E), disabled: E.disabled }]),
              "aria-disabled": E.disabled || void 0,
              onClick: (U) => $(U, E)
            }, {
              default: Y(() => [
                E.icon ? (n(), L(C, {
                  key: 0,
                  icon: E.icon,
                  width: 18
                }, null, 8, ["icon"])) : f("", !0),
                u("span", um, k(E.label), 1)
              ]),
              _: 2
            }, 1032, ["to", "class", "aria-disabled", "onClick"]))
          ], 64))), 128))
        ])
      ], 42, jf);
    };
  }
}, dm = /* @__PURE__ */ B(cm, [["__scopeId", "data-v-53a007f2"]]), fm = {
  key: 0,
  class: "fluent-splash-screen"
}, mm = { class: "splash-content" }, vm = {
  key: 0,
  class: "splash-logo"
}, pm = ["src"], hm = {
  key: 1,
  class: "splash-title"
}, ym = {
  key: 2,
  class: "splash-subtitle"
}, bm = {
  __name: "SplashScreen",
  props: {
    modelValue: { type: Boolean, default: !1 },
    logo: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    showProgress: { type: Boolean, default: !0 },
    duration: { type: Number, default: 0 }
  },
  emits: ["update:modelValue", "done"],
  setup(e, { emit: s }) {
    const t = e, a = s;
    return J(() => t.modelValue, (o) => {
      o && t.duration > 0 && setTimeout(() => {
        a("update:modelValue", !1), a("done");
      }, t.duration);
    }), (o, i) => (n(), L(te, { name: "splash" }, {
      default: Y(() => [
        e.modelValue ? (n(), l("div", fm, [
          u("div", mm, [
            e.logo ? (n(), l("div", vm, [
              u("img", {
                src: e.logo,
                alt: "Logo"
              }, null, 8, pm)
            ])) : f("", !0),
            e.title ? (n(), l("div", hm, k(e.title), 1)) : f("", !0),
            e.subtitle ? (n(), l("div", ym, k(e.subtitle), 1)) : f("", !0),
            e.showProgress ? (n(), L(ge, {
              key: 3,
              size: 32
            })) : f("", !0)
          ])
        ])) : f("", !0)
      ]),
      _: 1
    }));
  }
}, gm = /* @__PURE__ */ B(bm, [["__scopeId", "data-v-4d9b798b"]]), Ge = {
  solid: {
    type: "solid",
    tintOpacity: 1,
    luminosityOpacity: 1,
    blurAmount: 0
  },
  acrylic: {
    type: "acrylic",
    tintOpacity: 0.8,
    luminosityOpacity: 0.65,
    blurAmount: 30
  },
  mica: {
    type: "mica",
    tintOpacity: 0.8,
    luminosityOpacity: 0.75,
    blurAmount: 0
  },
  "mica-alt": {
    type: "mica-alt",
    tintOpacity: 0.75,
    luminosityOpacity: 0.7,
    blurAmount: 0
  },
  none: {
    type: "none",
    tintOpacity: 0,
    luminosityOpacity: 0,
    blurAmount: 0
  }
};
function Sm(e) {
  const s = typeof e == "string" ? Ge[e] || Ge.solid : e;
  return {
    "--material-type": s.type,
    "--material-tint-opacity": String(s.tintOpacity ?? 1),
    "--material-luminosity-opacity": String(s.luminosityOpacity ?? 1),
    "--material-blur": `${s.blurAmount ?? 0}px`
  };
}
const km = (e) => {
  e.component("FluentAnimatedIcon", St), e.component("FluentAppBarButton", Bt), e.component("FluentAppBarSeparator", Tt), e.component("FluentAppBarToggleButton", At), e.component("FluentAutoSuggestBox", Ut), e.component("FluentBackToTop", Xt), e.component("FluentBreadcrumbBar", an), e.component("FluentButton", be), e.component("FluentCalendarDatePicker", gn), e.component("FluentCanvas", $n), e.component("FluentCard", Xe), e.component("FluentCheckBox", pe), e.component("FluentCol", In), e.component("FluentColorPicker", Qn), e.component("FluentComboBox", il), e.component("FluentCommandBar", gl), e.component("FluentContentDialog", Vl), e.component("FluentControlExample", Ll), e.component("FluentDatePicker", jl), e.component("FluentDataGrid", ca), e.component("FluentDescriptions", pa), e.component("FluentDivider", ya), e.component("FluentDrawer", _a), e.component("FluentDropDownButton", Ba), e.component("FluentEmptyState", Aa), e.component("FluentExpander", Ga), e.component("FluentFloatButton", Ja), e.component("FluentFlipView", to), e.component("FluentFlyout", io), e.component("FluentGrid", uo), e.component("FluentGridView", po), e.component("FluentHorizontalScrollContainer", bo), e.component("FluentHyperlinkButton", wo), e.component("FluentIcon", C), e.component("FluentImage", Mo), e.component("FluentImageViewer", Ao), e.component("FluentInfoBadge", Do), e.component("FluentInfoBar", Go), e.component("FluentInput", Ze), e.component("FluentItemsRepeater", ns), e.component("FluentItemsView", rs), e.component("FluentListBox", ms), e.component("FluentLiquidGlass", hs), e.component("FluentListView", zs), e.component("FluentMediaPlayer", Qe), e.component("FluentMediaPlayerElement", oi), e.component("FluentMenuBar", pi), e.component("FluentModal", $i), e.component("FluentNavigationView", Di), e.component("FluentNumberBox", Xi), e.component("FluentPageHeader", ar), e.component("FluentPasswordBox", fr), e.component("FluentParallaxView", vr), e.component("FluentPersonPicture", gr), e.component("FluentPipsPager", Cr), e.component("FluentPivot", Tr), e.component("FluentPivotItem", Nr), e.component("FluentPopup", Ar), e.component("FluentProgressBar", Kr), e.component("FluentProgressRing", ge), e.component("FluentPullToRefresh", jr), e.component("FluentRadioButton", Jr), e.component("FluentRating", su), e.component("FluentRelativePanel", ru), e.component("FluentRepeatButton", du), e.component("FluentResult", yu), e.component("FluentRichEditBox", Cu), e.component("FluentRichTextBlock", Iu), e.component("FluentRow", Mu), e.component("FluentScrollBar", Pu), e.component("FluentScrollViewer", Nu), e.component("FluentSegmented", Lu), e.component("FluentSelect", Wu), e.component("FluentSelectorBar", Zu), e.component("FluentSelectorBarItem", tc), e.component("FluentSemanticZoom", lc), e.component("FluentSettingsCard", fc), e.component("FluentSkeleton", vc), e.component("FluentSlider", $c), e.component("FluentSpace", _c), e.component("FluentSplitButton", Mc), e.component("FluentSplitView", Rc), e.component("FluentStackPanel", zc), e.component("FluentStatistics", Hc), e.component("FluentSwipeControl", Qc), e.component("FluentTabView", sd), e.component("FluentTabs", md), e.component("FluentTeachingTip", $d), e.component("FluentTextBox", Bd), e.component("FluentTextBlock", Td), e.component("FluentTheme", Rd), e.component("FluentTimePicker", Dd), e.component("FluentTimeline", Yd), e.component("FluentTitleBar", ef), e.component("FluentToast", cf), e.component("FluentToggle", vf), e.component("FluentToggleButton", gf), e.component("FluentToggleSwitch", wf), e.component("FluentTooltip", xf), e.component("FluentTreeView", Rf), e.component("FluentVariableSizedWrapGrid", zf), e.component("FluentViewbox", Ef), e.component("FluentWatermark", Of), e.component("FullscreenToggle", Hf), e.component("SecondarySidebarMenu", dm), e.component("SplashScreen", gm);
}, xm = { install: km };
export {
  St as FluentAnimatedIcon,
  Bt as FluentAppBarButton,
  Tt as FluentAppBarSeparator,
  At as FluentAppBarToggleButton,
  Ut as FluentAutoSuggestBox,
  Xt as FluentBackToTop,
  an as FluentBreadcrumbBar,
  be as FluentButton,
  gn as FluentCalendarDatePicker,
  $n as FluentCanvas,
  Xe as FluentCard,
  pe as FluentCheckBox,
  In as FluentCol,
  Qn as FluentColorPicker,
  il as FluentComboBox,
  gl as FluentCommandBar,
  Vl as FluentContentDialog,
  Ll as FluentControlExample,
  ca as FluentDataGrid,
  jl as FluentDatePicker,
  pa as FluentDescriptions,
  ya as FluentDivider,
  _a as FluentDrawer,
  Ba as FluentDropDownButton,
  Aa as FluentEmptyState,
  Ga as FluentExpander,
  to as FluentFlipView,
  Ja as FluentFloatButton,
  io as FluentFlyout,
  uo as FluentGrid,
  po as FluentGridView,
  bo as FluentHorizontalScrollContainer,
  wo as FluentHyperlinkButton,
  C as FluentIcon,
  Mo as FluentImage,
  Ao as FluentImageViewer,
  Do as FluentInfoBadge,
  Go as FluentInfoBar,
  Ze as FluentInput,
  ns as FluentItemsRepeater,
  rs as FluentItemsView,
  hs as FluentLiquidGlass,
  ms as FluentListBox,
  zs as FluentListView,
  Qe as FluentMediaPlayer,
  oi as FluentMediaPlayerElement,
  pi as FluentMenuBar,
  $i as FluentModal,
  Di as FluentNavigationView,
  Xi as FluentNumberBox,
  ar as FluentPageHeader,
  vr as FluentParallaxView,
  fr as FluentPasswordBox,
  gr as FluentPersonPicture,
  Cr as FluentPipsPager,
  Tr as FluentPivot,
  Nr as FluentPivotItem,
  Ar as FluentPopup,
  Kr as FluentProgressBar,
  ge as FluentProgressRing,
  jr as FluentPullToRefresh,
  Jr as FluentRadioButton,
  su as FluentRating,
  ru as FluentRelativePanel,
  du as FluentRepeatButton,
  yu as FluentResult,
  Cu as FluentRichEditBox,
  Iu as FluentRichTextBlock,
  Mu as FluentRow,
  Pu as FluentScrollBar,
  Nu as FluentScrollViewer,
  Lu as FluentSegmented,
  Wu as FluentSelect,
  Zu as FluentSelectorBar,
  tc as FluentSelectorBarItem,
  lc as FluentSemanticZoom,
  fc as FluentSettingsCard,
  vc as FluentSkeleton,
  $c as FluentSlider,
  _c as FluentSpace,
  Mc as FluentSplitButton,
  Rc as FluentSplitView,
  zc as FluentStackPanel,
  Hc as FluentStatistics,
  Qc as FluentSwipeControl,
  sd as FluentTabView,
  md as FluentTabs,
  $d as FluentTeachingTip,
  Td as FluentTextBlock,
  Bd as FluentTextBox,
  Rd as FluentTheme,
  Dd as FluentTimePicker,
  Yd as FluentTimeline,
  ef as FluentTitleBar,
  cf as FluentToast,
  vf as FluentToggle,
  gf as FluentToggleButton,
  wf as FluentToggleSwitch,
  xf as FluentTooltip,
  Rf as FluentTreeView,
  zf as FluentVariableSizedWrapGrid,
  Ef as FluentViewbox,
  Of as FluentWatermark,
  Hf as FullscreenToggle,
  Ge as MaterialPresets,
  dm as SecondarySidebarMenu,
  gm as SplashScreen,
  xm as default,
  Sm as getMaterialStyles,
  km as install
};
