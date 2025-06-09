function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "/DSC106_Final_Project/"
  : "/DSC106_Final_Project/"; 

const pages = [
  { url: "medication_effects/", title: "Medication Effects" },
  { url: "", title: "Predictor" },
  { url: "https://physionet.org/content/sleep-edfx/1.0.0/", title: "Data" }
];

const nav = document.createElement("nav");
document.body.prepend(nav);

for (let page of pages) {
  let url = page.url;
  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  const a = document.createElement("a");
  a.href = url;
  a.textContent = page.title;

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.appendChild(a);
}
// document.body.insertAdjacentHTML(
//     "afterbegin",
//     `
//         <label class="color-scheme">
//             Theme:
//             <select>
//                 <option value="light dark">Automatic</option>
//                 <option value="light">Light</option>
//                 <option value="dark">Dark</option>
//             </select>
//         </label>`,
// );

const select = document.querySelector(".color-scheme select");

function setColorScheme(scheme) {
    document.documentElement.style.setProperty("color-scheme", scheme);
    select.value = scheme;
}
  
select.addEventListener("input", (e) => {
    const value = e.target.value;
    setColorScheme(value);
    localStorage.colorScheme = value;
});
  
if ("colorScheme" in localStorage) {
    setColorScheme(localStorage.colorScheme);
}

const form = document.querySelector("form");

form?.addEventListener("submit", (event) => {
  event.preventDefault(); 

  const data = new FormData(form);
  const params = [];

  for (let [key, value] of data) {
    params.push(`${key}=${encodeURIComponent(value)}`);
  }

  const query = params.join("&");
  const url = `${form.action}?${query}`;

  location.href = url; 
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// export function renderProjects(projects, containerElement, headingLevel = 'h2') {
//   if (!containerElement) {
//     console.error("No valid container element provided.");
//     return;
//   }

//   containerElement.innerHTML = '';

//   for (const project of projects) {
//     const article = document.createElement('article');
//     article.innerHTML = `
//       <${headingLevel}>${project.title}</${headingLevel}>
//       <img src="${project.image}" alt="${project.title}">
//       <div>
//         <p>${project.description}</p>
//         <p class="project-year">${project.year}</p>
//       </div>
//     `;
//     containerElement.appendChild(article);
//   }
// }

// export async function fetchGitHubData(username) {
//   return fetchJSON(`https://api.github.com/users/${username}`);
// }

