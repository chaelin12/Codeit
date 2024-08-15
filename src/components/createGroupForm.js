export function createGroupForm() {
  // 폼 컨테이너 생성
  const container = document.createElement("div");
  container.className = "container";

  // 제목
  const title = document.createElement("h1");
  title.textContent = "그룹 만들기";
  container.appendChild(title);

  // 그룹명 입력
  const groupNameLabel = document.createElement("label");
  groupNameLabel.textContent = "그룹명";
  container.appendChild(groupNameLabel);

  const groupNameInput = document.createElement("input");
  groupNameInput.type = "text";
  groupNameInput.placeholder = "그룹명을 입력해 주세요";
  container.appendChild(groupNameInput);

  // 대표 이미지 업로드
  const imageLabel = document.createElement("label");
  imageLabel.textContent = "대표 이미지";
  container.appendChild(imageLabel);

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  container.appendChild(imageInput);

  // 그룹 소개 입력
  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "그룹 소개";
  container.appendChild(descriptionLabel);

  const descriptionTextarea = document.createElement("textarea");
  descriptionTextarea.placeholder = "그룹을 소개해 주세요";
  container.appendChild(descriptionTextarea);

  // 공개 여부 선택 (토글 스위치)
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

  // 비밀번호 입력
  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "비밀번호";
  container.appendChild(passwordLabel);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "비밀번호를 입력해 주세요";
  container.appendChild(passwordInput);

  // 만들기 버튼
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
    if (publicSwitchInput.checked) {
      publicSwitchLabel.textContent = "공개";
    } else {
      publicSwitchLabel.textContent = "비공개";
    }
  });

  return container;
}
