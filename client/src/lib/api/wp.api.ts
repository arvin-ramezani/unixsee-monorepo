// const API_URL = "https://api.unixsee.com/wp-json";
const API_URL =
  "https://api.unixsee.com/index.php?rest_route=/unixsee/v1/home&lang=fa";

export async function getFirstConnection() {
  const response = await fetch(`${API_URL}`, {
    headers: {
      "X-Unixsee-Api-Key":
        "uxc_6ZjuWGio2dJX4mlukeWf5UukWfYECLfbmVyYFyGnFwX0MloU",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json();

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return data;
}
