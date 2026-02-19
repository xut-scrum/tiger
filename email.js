(function initEmailForm() {
    function norm(s) {
        return String(s || "").trim();
    }

    function setError(input, errEl, message) {
        input.setAttribute("aria-invalid", "true");
        if (errEl && errEl.id) input.setAttribute("aria-describedby", errEl.id);
        if (errEl) {
            errEl.textContent = message;
            errEl.hidden = false;
        }
    }

    function clearError(input, errEl) {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
        if (errEl) errEl.hidden = true;
    }

    function isEmailValid(input) {
        return input.checkValidity();
    }

    function buildRecipientEmail() {
        // TODO: set your recipient here (split to avoid a single obvious "email@domain" string in the source)
        const USER = "tigerfansite";
        const DOMAIN = "example.com";
        return `${USER}@${DOMAIN}`;
    }

    function buildBody(fields) {
        return [
            "New message from Tiger Fan Site",
            "",
            `Name: ${fields.name}`,
            `Email: ${fields.email}`,
            "",
            "Message:",
            fields.message
        ].join("\n");
    }

    function mailtoUrl(to, subject, body) {
        const s = encodeURIComponent(subject);
        const b = encodeURIComponent(body);
        return `mailto:${encodeURIComponent(to)}?subject=${s}&body=${b}`;
    }

    const form = document.getElementById("email_form");
    if (!form) return;

    const hint = document.getElementById("ef_hint");

    const nameInput = document.getElementById("ef_name");
    const emailInput = document.getElementById("ef_email");
    const subjectInput = document.getElementById("ef_subject");
    const messageInput = document.getElementById("ef_message");

    const nameErr = document.getElementById("ef_name_err");
    const emailErr = document.getElementById("ef_email_err");
    const subjectErr = document.getElementById("ef_subject_err");
    const messageErr = document.getElementById("ef_message_err");

    function validate() {
        let ok = true;

        const name = norm(nameInput && nameInput.value);
        const email = norm(emailInput && emailInput.value);
        const subject = norm(subjectInput && subjectInput.value);
        const message = norm(messageInput && messageInput.value);

        clearError(nameInput, nameErr);
        clearError(emailInput, emailErr);
        clearError(subjectInput, subjectErr);
        clearError(messageInput, messageErr);

        if (!name) { setError(nameInput, nameErr, "Please type your name."); ok = false; }

        if (!email) { setError(emailInput, emailErr, "Email is required."); ok = false; }
        else if (!isEmailValid(emailInput)) { setError(emailInput, emailErr, "Please enter a valid email address."); ok = false; }

        if (!subject) { setError(subjectInput, subjectErr, "Subject is required."); ok = false; }
        if (!message) { setError(messageInput, messageErr, "Please type your message."); ok = false; }

        return { ok, fields: { name, email, subject, message } };
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (hint) hint.textContent = "";

        const res = validate();
        if (!res.ok) return;

        const to = buildRecipientEmail();
        const body = buildBody(res.fields);
        const url = mailtoUrl(to, res.fields.subject, body);

        if (hint) hint.textContent = "Opening your email app...";
        window.location.assign(url);
    });
})();
