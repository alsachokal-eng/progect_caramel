document.addEventListener("DOMContentLoaded", function () {
  console.log("Order form script loaded");

  var form = document.getElementById("order-form");
  var webhookUrl = "https://hook.eu1.make.com/bpj0xrlabzcvknkbd67v4up2wc212n7e"; // Вставте свій Make webhook URL

  if (!form) {
    console.error("Order form not found");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Order form submit triggered");

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    var formData = new FormData(form);
    var data = {
      name: (formData.get("name") || "").toString().trim(),
      contact: (formData.get("contact") || "").toString().trim(),
      flavor: (formData.get("flavor") || "").toString(),
      quantity: (formData.get("quantity") || "1").toString(),
      submittedAt: new Date().toISOString(),
    };

    if (!data.name || !data.contact || !data.flavor || !data.quantity) {
      alert("Будь ласка, заповніть усі поля перед відправленням.");
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    console.log("Sending webhook payload:", data);

    var controller = new AbortController();
    var timeout = setTimeout(function () {
      controller.abort();
    }, 10000);

    fetch(webhookUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
      .then(function (response) {
        clearTimeout(timeout);
        return response.text().then(function (text) {
          console.log("Webhook response status:", response.status, response.statusText);
          console.log("Webhook response body:", text);

          if (!response.ok) {
            throw new Error("Помилка відправлення: " + response.status + " " + response.statusText);
          }

          try {
            return JSON.parse(text);
          } catch (e) {
            return {};
          }
        });
      })
      .then(function () {
        alert("Дякуємо! Заявка надіслана. Ми підготуємо її в Excel.");
        form.reset();
      })
      .catch(function (error) {
        console.error(error);
        if (error.name === 'AbortError') {
          alert('Таймаут при відправленні. Спробуйте ще раз.');
        } else {
          alert("Не вдалося надіслати заявку. Перевірте URL вебхука Make та доступ до мережі.");
        }
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
});
