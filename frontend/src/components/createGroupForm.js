export function createGroupForm() {
  const container = document.createElement("div");
  container.className = "container";

  const title = document.createElement("h1");
  title.textContent = "그룹 만들기";
  container.appendChild(title);

  const groupNameLabel = document.createElement("label");
  groupNameLabel.textContent = "그룹명";
  groupNameLabel.setAttribute("for", "groupName");
  container.appendChild(groupNameLabel);

  const groupNameInput = document.createElement("input");
  groupNameInput.type = "text";
  groupNameInput.id = "groupName";
  groupNameInput.placeholder = "그룹명을 입력해 주세요";
  container.appendChild(groupNameInput);

  const imageLabel = document.createElement("label");
  imageLabel.textContent = "대표 이미지";
  container.appendChild(imageLabel);

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  container.appendChild(imageInput);

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "그룹 소개";
  container.appendChild(descriptionLabel);

  const descriptionTextarea = document.createElement("textarea");
  descriptionTextarea.placeholder = "그룹을 소개해 주세요";
  container.appendChild(descriptionTextarea);

  const publicSwitchContainer = document.createElement("div");
  publicSwitchContainer.className = "toggle-switch";

  const publicSwitchInput = document.createElement("input");
  publicSwitchInput.type = "checkbox";
  publicSwitchInput.id = "publicSwitch";

  const publicSwitchSpan = document.createElement("span");
  const publicSwitchLabel = document.createElement("label");
  publicSwitchLabel.setAttribute("for", "publicSwitch");
  publicSwitchLabel.textContent = "공개";

  publicSwitchContainer.appendChild(publicSwitchInput);
  publicSwitchContainer.appendChild(publicSwitchSpan);
  publicSwitchContainer.appendChild(publicSwitchLabel);
  container.appendChild(publicSwitchContainer);

  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "비밀번호";
  container.appendChild(passwordLabel);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "비밀번호를 입력해 주세요";
  container.appendChild(passwordInput);

  const submitButton = document.createElement("button");
  submitButton.textContent = "만들기";
  container.appendChild(submitButton);

  // Placeholder와 입력된 텍스트 색상 제어
  [groupNameInput, descriptionTextarea, passwordInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (input.value.trim() !== "") {
        input.classList.add("filled");
      } else {
        input.classList.remove("filled");
      }
    });
  });

  // 토글 스위치 변경 시 공개/비공개 텍스트 변경
  publicSwitchInput.addEventListener("change", () => {
    publicSwitchLabel.textContent = publicSwitchInput.checked
      ? "공개"
      : "비공개";
  });

  // 버튼의 기본 동작 제어
  submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    // 폼 제출 시 수행할 로직 추가
  });

  return container;
}
