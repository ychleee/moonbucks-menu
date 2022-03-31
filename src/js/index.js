//Todo 요구사항
//[X] 웹 서버를 띄운다.
//[ ] 서버에 새로운 메뉴명을 추가할 수 있도록 요청한다.
//[ ] 카테고리별 메뉴 리스트를 불러온다. 
//[ ] 서버에 메뉴의 품절상태를 토글할 수 있도록 요청한다. 
//[ ] 서버에 메뉴가 삭제될 수 있도록 요청한다.


//Todo 리팩토링
//[ ] Local Storage에 저장하는 로직은 지운다.
//[ ] fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.

//Todo 사용자 구분
//[ ] API 통신에 실패하는 경우에 대해 사용자가 알 수 있게 alert로 예외처리를 진행한다.
//[ ] 중복되는 메뉴는 추가할 수 없다. 

import { $ } from './utils/dom.js';
import store from "./store/index.js"

  //local storage에 저장된 데이터 => '상태' 이 상태를 fuction App이라는 function에서 상태[변할수 있는 데이터, 이 앱에서 변하는 것이 무엇인가]를 가지고 있는게 뭘까? => 메뉴명, 개수(그런데, 개수는 메뉴명(array)의 길이로부터 추론할 수 있으므로 상태로 관리할 필요 없다.) 

//fetch('url', option) 

// URL 계속 재사용되므로 입력해놓기
const BASE_URL = "http://localhost:3000";

const menuApi = {
  async getAllMenuByCategory(category){
    const response = await fetch (`${BASE_URL}/api/category/${category}/menu`);
    return response.json();
    console.log(`getAllMenuByCategory함수에서 반환하는 값은 ${response.json()} 임.`); // Why unreachable?
  }
  ,async createMenu(category, name){
    const response = await fetch(`${BASE_URL}/api/category/${category}/menu`, {
      method: "POST",  // 개체가 새로 생성될 경우 하는 약속
      headers: {
        "Content-Type" : "application/json",
      },
      body: JSON.stringify({name}),
    });
    if (!response.ok) {
      console.log("Error");
    };
  }
}

function App() {

  //함수가 실행될 떄마다 변화하는 상태들.
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };
  // => 새로 생성되는 객체 instance의 menu property를 이러한 형태의 객체로 생성 했다. 

  this.currentCategory = "espresso"; 
  // => 디폴트 값은 espresso로.

  //initial rendering 
  this.init = async () => {
    this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
    render();
    initEventListners();
  }
  // => init이라는 async 함수를 정의하는데, 이 함수의 메뉴에서 currentCategory 즉 "espresso"의 value에 해당하는 것(리스트)에다가 
  // => 메뉴에이피아아이 객체의 getAllMenuByCategory라는 메소드를 사용해라. 메소드의 입력값은 this.currentcategory(즉 "espresso")
  // => 렌더함수 실행해주고, initEventListners 실행해줘라. 

  const render = () => {
    const template = this.menu[this.currentCategory].map((menuItem, index) => {
      //상태값에 다라 true면 soldout을 추가하고 $m아니면 아닌 방법 잘 살펴볼 것. 
      return`
      <li data-menu-id= "${index}" class=" menu-list-item d-flex items-center py-2">
        <span class=" ${menuItem.soldOut ? "sold-out": ""} w-100 pl-2 menu-name">${menuItem.name}</span>
        <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
      >
        품절
      </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
        >
          수정
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
        >
          삭제
        </button>
      </li>`
    }).join("")
    //join method => 
    $("#menu-list").innerHTML = template;
    updateMenuCount();
  }

  //입력 값 받아서 list 형성
  const addMenuName = async (e) => {

    if ($("#menu-name").value === ""){
        alert("Please enter a value.");
        return;
    }

    const menuName = $("#menu-name").value;
    
    await menuApi.createMenu(this.currentCategory, menuName);

    this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
    render();
    $("#menu-name").value = "";

      //join method => 배열로 저장되어 있는 것들을 하나로 뭉쳐줌. 

  };

  //메뉴 수 카운트
  const updateMenuCount = () => {
    let menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount}개`;
  }

  //메뉴 수정
  const updateMenuName = (e) => {
    let i = findOutI(e);
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const updatedMenuName = prompt("Change the menu", $menuName.innerText);
    this.menu[this.currentCategory][i].name = updatedMenuName;
    store.setLocalStorage(this.menu);
    console.log(`${i}에 있는 메뉴이름을 ${updatedMenuName}으로 수정합니다.`);
    render();
  }

  //메뉴 삭제 
  const removeMenuName = (e) => {
    if (confirm("Do you really want to delete the menu?") == true) {
      //problem => 메뉴 아이디로 트랙하면 안됨. 그것보다는 이벤트가 발생한 List가 전체 UL에서 몇번째인지가 나와야 함 => indexof method?
      //현재 '삭제' 클릭한 리스트 확보
      let i = findOutI(e);
      console.log(`${i}에 있는 메뉴를 삭제합니다.`);

      this.menu[this.currentCategory].splice(i, 1);
      render();
      store.setLocalStorage(this.menu[this.currentCategory]);

    } else {
      return;
    }
  };

  //품절 관리
  const soldOutMenu = (e) => {
    const i = findOutI(e);
    this.menu[this.currentCategory][i].soldOut = !this.menu[this.currentCategory][i].soldOut;
    //toggle => 처음에는 undefined여서 반대면 true, 그 다음에는 true 이므로 false로 전환
    store.setLocalStorage(this.menu);
    render();
  }

  //ul안에서 li의 순서 찾기
  const findOutI = (e) => {
    const presentItem = e.target.closest("li");
    const wholeList = e.target.closest("ul").querySelectorAll("li");
    let i = 0;
    while (wholeList[i] != presentItem) {
      i++;
    };
    return i;
  } 

//이벤트 바인딩

  const initEventListners = () => {
    //입력 누를 때 디폴트 실행값 멈춰주기. 폼 태그가 입력값을 자동으로 전송하는 것을 막아주는 함수를 정의함.
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    //확인 입력
    $("#menu-submit-button").addEventListener("click", addMenuName);
    // => 메뉴 써밋 버튼? => 

    //엔터 입력
    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName(e);
    });

    //수정하기와 삭제하기
    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return; // if문이 연달아 있을 때는 return을 해주는 습관 => 불필요한 연산 안해도 됨
      }
      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }
      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
      }
    });

    //내비게이션
    $("nav").addEventListener("click", (e) => {
      const isCategoryButton =
        e.target.classList.contains("cafe-category-name");
      if (isCategoryButton) {
        const categoryName = e.target.dataset.categoryName;
        this.currentCategory = categoryName;
        $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
        render(e);
      }
    });
  };

};

// new => 하나의 함수로 여러 instance를 만듬? 함수를 모델로 새로운 객체들이 여러개 만들어질 수 있으며 각각의 상태를 가질 수 있다. 
//채팅창이 여러 개 띄워진 사이트들 => 채팅 창 하나하나가 각각의 인스턴스들. 
const app = new App();

//app 이라는 객체가 생성되고 그 객체의 init이라는 메서드를 불러옴 불러와서 위의 로직이 실현될 수 있도록.
app.init();



