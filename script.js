document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("order-form");
  var webhookUrl = "https://hook.make.com/teiqoiaxreouyo696y155xoodwin7haa@hook.eu1.make.com"; // Замініть на свій Make webhook URL

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

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

    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Помилка відправлення: " + response.statusText);
        }
        return response.json().catch(function () {
          return {};
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
