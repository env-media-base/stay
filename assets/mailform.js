/* =====================================================================
   かくれ宿 — フォームの「メール作成モード」
   2026-09-21：配信先を Netlify から Cloudflare Pages へ移したため、
   Netlify Forms（サーバー側でフォームを受け取る仕組み）が使えなくなった。
   代わりに、送信ボタンで「入力内容を本文に入れたメール」をメールアプリで開く。
   メールアプリが無い人のために、同じ内容をコピーできる欄も出す（取りこぼさない）。

   使い方：<form data-mailto="contact|consult|newsletter" data-done="完了表示の要素id"
                 data-scope="完了時に is-submitted を付ける要素のセレクタ">
   ===================================================================== */
(function () {
  "use strict";
  var TO = "kakureyado.official@gmail.com";
  var EN = (document.documentElement.getAttribute("lang") || "").indexOf("en") === 0;

  var T = EN ? {
    subject: {
      contact: "[Kakureyado CHIBA] Inquiry about coverage",
      consult: "[Kakureyado CHIBA] Free consultation request",
      newsletter: "[Kakureyado CHIBA] Newsletter sign-up"
    },
    intro: {
      contact: "I would like to inquire about coverage on Kakureyado CHIBA.",
      consult: "I would like to request a free consultation.",
      newsletter: "I would like to receive the Kakureyado CHIBA newsletter."
    },
    greet: "To: Kakureyado CHIBA",
    footer: "(This email was created from the form on the Kakureyado CHIBA website.)",
    doneTitle: "Your email app has opened.",
    doneLead: {
      contact: "Please check the content and press <strong>Send</strong>. We will reply within 3 business days.",
      consult: "Please check the content and press <strong>Send</strong>. We will reply within 3 business days.",
      newsletter: "Please press <strong>Send</strong> to complete your sign-up."
    },
    fallback: "If no email app opened, please copy the text below and send it to ",
    copy: "Copy",
    copied: "Copied",
    reopen: "Open the email again"
  } : {
    subject: {
      contact: "【かくれ宿CHIBA】取材・掲載のご相談",
      consult: "【かくれ宿CHIBA】無料相談のお申し込み",
      newsletter: "【かくれ宿CHIBA】メルマガ登録希望"
    },
    intro: {
      contact: "かくれ宿CHIBAへの取材・掲載について相談させてください。",
      consult: "無料相談を申し込みます。",
      newsletter: "かくれ宿CHIBAのメルマガ（新着の宿のお知らせ）を希望します。"
    },
    greet: "かくれ宿CHIBA 御中",
    footer: "（このメールは、かくれ宿CHIBAのサイトのフォームから作成されました）",
    doneTitle: "メールの作成画面を開きました。",
    doneLead: {
      contact: "内容をご確認のうえ、そのまま<strong>送信</strong>してください。3営業日以内にご返信いたします。",
      consult: "内容をご確認のうえ、そのまま<strong>送信</strong>してください。3営業日以内にご返信いたします。",
      newsletter: "そのまま<strong>送信</strong>していただければ、登録完了です。"
    },
    fallback: "メールが開かない場合は、下の内容をコピーして、次のアドレスへお送りください：",
    copy: "コピーする",
    copied: "コピーしました",
    reopen: "メールをもう一度開く"
  };

  // ラベルの見出し文字だけを取る（「必須」「任意」などの小さい印は除く）
  function labelText(el) {
    var wrap = el.closest(".field") || el.parentNode;
    var lab = wrap && wrap.querySelector("label");
    if (!lab) return el.getAttribute("aria-label") || (el.type === "email" ? (EN ? "Email" : "メールアドレス") : el.name);
    var s = "";
    lab.childNodes.forEach(function (n) { if (n.nodeType === 3) s += n.textContent; });
    s = s.replace(/\s+/g, " ").trim();
    return s || el.name;
  }

  function compose(form, kind) {
    var lines = [T.greet, "", T.intro[kind], ""];
    var seen = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === "hidden" || el.type === "submit" || el.name === "bot-field") return;
      if (seen[el.name]) return;
      var value;
      if (el.type === "checkbox") {
        // 同じ name のチェックボックスはまとめて1行に
        var picked = Array.prototype.filter.call(form.querySelectorAll('input[type=checkbox][name="' + el.name + '"]'), function (c) { return c.checked; })
          .map(function (c) { return c.value; });
        value = picked.join(EN ? ", " : "、");
        seen[el.name] = true;
        var group = el.closest(".field");
        var head = group && group.querySelector("label:not(.check)");
        var name = head ? labelText(head) : el.name;
        if (value) lines.push("■ " + name + (EN ? ": " : "：") + value);
        return;
      }
      value = (el.value || "").trim();
      seen[el.name] = true;
      if (!value) return;
      if (el.tagName === "TEXTAREA") {
        lines.push("■ " + labelText(el), value, "");
      } else {
        lines.push("■ " + labelText(el) + (EN ? ": " : "：") + value);
      }
    });
    lines.push("", T.footer);
    return lines.join("\n").replace(/\n{3,}/g, "\n\n");
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function doneHTML(kind, href, body) {
    return '<h3>' + T.doneTitle + '</h3>' +
      '<p>' + T.doneLead[kind] + '</p>' +
      '<div class="mail-fallback">' +
        '<p>' + T.fallback + '<a href="mailto:' + TO + '">' + TO + '</a></p>' +
        '<textarea readonly rows="8">' + esc(body) + '</textarea>' +
        '<div class="mail-fallback-actions">' +
          '<button type="button" class="mail-copy">' + T.copy + '</button>' +
          '<a class="mail-reopen" href="' + esc(href) + '">' + T.reopen + '</a>' +
        '</div>' +
      '</div>';
  }

  function wireCopy(box) {
    var btn = box.querySelector(".mail-copy");
    var ta = box.querySelector(".mail-fallback textarea");
    if (!btn || !ta) return;
    btn.addEventListener("click", function () {
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(function () { btn.textContent = T.copied; });
      } else if (ok) {
        btn.textContent = T.copied;
      }
    });
  }

  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var kind = form.getAttribute("data-mailto");
      var subject = T.subject[kind];
      var inn = form.elements["inn-name"] && form.elements["inn-name"].value.trim();
      if (inn) subject += EN ? " (" + inn + ")" : "（" + inn + "）";
      var body = compose(form, kind);
      var href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      // 完了表示（ページにある完了枠を使う。無ければフォームの直後に作る）
      var box = document.getElementById(form.getAttribute("data-done") || "");
      if (!box) {
        box = document.createElement("div");
        box.className = "mail-done";
        form.parentNode.insertBefore(box, form.nextSibling);
        form.style.display = "none";
      }
      box.innerHTML = doneHTML(kind, href, body);
      wireCopy(box);
      var scope = form.getAttribute("data-scope");
      var scopeEl = scope ? document.querySelector(scope) : null;
      if (scopeEl) scopeEl.classList.add("is-submitted");
      box.scrollIntoView({ behavior: "smooth", block: "center" });

      // 動作確認のときだけ window.kakureMailOpen で差し替えられる（本番では未定義＝メールアプリを開く）
      (window.kakureMailOpen || function (h) { window.location.href = h; })(href);
    });
  });
})();
