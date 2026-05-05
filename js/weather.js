async function getWeather() {
  const el = document.getElementById("weather");

  const apiKey = localStorage.getItem("weatherKey"); // from settings
  const city = "Helsinki";

  // If no key → show message
  if (!apiKey) {
    el.innerHTML = "Add OpenWeather API key in Settings";
    return;
  }

  try {
    el.innerText = "Loading weather...";

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    el.innerHTML = `
      <h5>Väder ${city}</h5>
      <p>${data.main.temp}°C</p>
      <p>${data.weather[0].description}</p>
    `;

  } catch (err) {
    el.innerHTML = "Could not load weather";
    console.error(err);
  }
}