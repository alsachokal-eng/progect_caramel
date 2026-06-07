document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("order-form");
  const statusText = document.getElementById("order-status");
  const submitBtn = form ? form.querySelector("button[type='submit']") : null;
  const webhookUrl = form?.dataset?.webhookUrl || "";

  if (!form) {
    console.error("Order form not found");
    return;
  }

  function showStatus(message, isError) {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.style.color = isError ? "#9b4b35" : "#6c5d51";
  }

  async function sendOrder(orderData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        signal: controller.signal,
      });

      const text = await response.text();
      console.log("Webhook response:", response.status, response.statusText, text);

      if (!response.ok) {
        throw new Error(`Помилка відправлення: ${response.status} ${response.statusText}`);
      }

      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!webhookUrl || webhookUrl.includes("YOUR_WEBHOOK_ID")) {
      showStatus("Оновіть webhook URL у формі перед відправкою.", true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Надсилається...";
    }

    const formData = new FormData(form);
    const orderData = {
      name: (formData.get("name") || "").toString().trim(),
      contact: (formData.get("contact") || "").toString().trim(),
      flavor: (formData.get("flavor") || "").toString(),
      quantity: Number(formData.get("quantity") || 1),
      submittedAt: new Date().toISOString(),
    };

    if (!orderData.name || !orderData.contact || !orderData.flavor || orderData.quantity < 1) {
      showStatus("Будь ласка, заповніть усі поля коректно.", true);
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtn) submitBtn.textContent = "Надіслати заявку";
      return;
    }

    showStatus("Заявка оброблюється...", false);

    try {
      await sendOrder(orderData);
      showStatus("Дякуємо! Ваша заявка успішно надіслана.", false);
      form.reset();
    } catch (error) {
      console.error(error);
      const isTimeout = error.name === "AbortError";
      showStatus(
        isTimeout
          ? "Таймаут при відправленні. Спробуйте ще раз." 
          : "Не вдалося надіслати заявку. Перевірте з'єднання та URL вебхука.",
        true
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Надіслати заявку";
      }
      setTimeout(() => {
        if (statusText) {
          statusText.textContent = "";
        }
      }, 7000);
    }
  });
});
