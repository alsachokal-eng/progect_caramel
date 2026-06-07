document.addEventListener("DOMContentLoaded", function () {
  console.log("Order form script loaded");
  var form = document.getElementById("order-form");
  var webhookUrl = "https://hook.eu1.make.com/bpj0xrlabzcvknkbd67v4up2wc212n7e"; // Замініть на свій Make webhook URL

  if (!form) {
    console.error("Order form not found");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Order form submit triggered");

    var formData = new FormData(form);
    var name = formData.get("name")?.toString().trim();
    var contact = formData.get("contact")?.toString().trim();
    var flavor = formData.get("flavor")?.toString();
    var quantity = formData.get("quantity")?.toString();

    if (!name || !contact || !flavor || !quantity) {
      alert("Будь ласка, заповніть усі поля перед відправленням.");
      return;
    }

    var payload = {
      name: name,
      contact: contact,
      flavor: flavor,
      quantity: quantity,
      submittedAt: new Date().toISOString(),
    };

    console.log("Sending webhook payload:", payload);

    fetch(webhookUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
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
        alert("Не вдалося надіслати заявку. Перевірте URL вебхука Make та доступ до мережі.");
      });
  });
});
