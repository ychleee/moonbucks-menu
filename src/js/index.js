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

  //local storage에 저장된 데이터 => '상태' 이 상태를 fuction App이라는 function에서 상태[변할수 있는 데이터, 이 앱에서 변하는 것이 무엇인가]를 가지고 있는게 뭘까? => 메뉴명, 개수(그런데, 개수는 메뉴명(array)의 길이로부터 추론할 수 있으므로 상태로 관리할 필요 없다.) 

//fetch('url', option) 

// URL 계속 재사용되므로 입력해놓기
const BASE_URL = "http://localhost:3000";

const menuApi = {
  async getAllMenuByCategory(category){
    const response = await fetch (`${BASE_URL}/api/category/${category}/menu`);
    return response.json();
  }
  ,async createMenu(category, name){
    const response = await fetch(`${BASE_URL}/api/category/${category}/menu`, {
      // category parameter는 uri 찾아가는데 사용됨. 
      method: "POST",  // 개체가 새로 생성될 경우 하는 약속
      headers: {
        "Content-Type" : "application/json",
      },
      body: JSON.stringify({name}),
      // stringify한 name을 넣어주기. 그런데 왜 중괄호? => javaScript에서 {} 에 스트링 "text"들어있는 변수 a 넣어주면 {"a": "text" }이렇게 저장됨  
    });
    console.log(response);
    if (!response.ok) {
      console.log("Error");
    };
  }
  ,async updateMenu(category, name, id, isSoldOut){
      console.log(JSON.stringify({name, isSoldOut}));
      const response =  await fetch(`${BASE_URL}/api/category/${category}/menu/${id}`, {
        method : "PUT", 
        headers : {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify({name, isSoldOut}),
        //왜 여기에서 name은 서버에 제대로 put 되는데, isSoldOut은 안되는가?
      });
  }
  ,async removeMenu(category, id){
      const response = await fetch(`${BASE_URL}/api/category/${category}/menu/${id}`, {
        method : "DELETE", 
        headers : {
          "Content-Type" : "application/json",
        },
      });
  }
  // ,async soldOutMenu(category, id, isSoldOut){
  //     const response = await fetch(`${BASE_URL}/api/category/${category}/menu/${id}`, {
  //       method : "PUT", 
  //       headers : {
  //         "Content-Type" : "application/json",
  //       },
  //       body: JSON.stringify({isSoldOut}),
  //     });
  // }
}


function App() {

  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };
  // => 새로 생성되는 객체 instance의 menu의 value를 위와 같은 형태로 생성함. 

  this.currentCategory = "espresso"; 
  // => 생성되는 객체의 currentCategory 디폴트 값은 espresso로.

  //initial rendering 
  this.init = async () => {
    this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
    console.log(this.menu[this.currentCategory]);
    render();
    initEventListners();
  }
  // => init이라는 async 함수를 정의하는데, 이 함수의 메뉴에서 currentCategory 즉 "espresso"의 value에 해당하는 것(리스트)에다가 
  // => menuApi 객체의 getAllMenuByCategory라는 메소드를 사용해라. 메소드의 입력값은 this.currentcategory(즉 "espresso")
  // => 렌더함수 실행해주고, initEventListners 실행해줘라. 

  const render = () => {
    console.log(`${this.currentCategory} 에 있는 아이템들을 렌더합니다.`);
    console.log(this.menu);
    const template = this.menu[this.currentCategory].map(menuItem => {
      return `
      <li data-menu-id= "${menuItem.id}" class=" menu-list-item d-flex items-center py-2">
        <span class= "${menuItem.isSoldOut ? "sold-out" : ""} w-100 pl-2 menu-name">${menuItem.name}</span>
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
      </li>`;
    }).join("")
    //join method => 원래는 어레이 형태로 받아졌을 텐데, 그것을 string으로 합침.  
    $("#menu-list").innerHTML = template;
    updateMenuCount();
  }

  //Create 부분.
  const addMenuName = async (e) => {
  //input 값이 없으면, "값을 넣어 주세요" 출력함.
    if ($("#menu-name").value === ""){
        alert("Please enter a value.");
        return;
    }
    //menuName이라는 변수에다가 input 값을 담아라.
    const menuName = $("#menu-name").value;
    //menuApi의 createMenu method 실행. 입력값은, 현 카테고리와 입력값. 
    await menuApi.createMenu(this.currentCategory, menuName);

    this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
    render();
    $("#menu-name").value = "";

  };

  //메뉴 수 카운트
  const updateMenuCount = () => {
    let menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount}개`;
  }

  //메뉴 수정
  const updateMenuName = async (e) => {
    let i = findOutI(e);
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const $menuId = e.target.closest("li").dataset.menuId;
    // event object 의 타겟속성에 closest method 적용. 거기에 다시 querySelector method 적용.=> 이벤트가 발생한 object에서 가장 가까운 li에서 menu-name이라는 클래스를 찾아라. (.은 class #은 id))
    const updatedMenuName = prompt("Change the menu", $menuName.innerText);
    this.menu[this.currentCategory][i].name = updatedMenuName;
    let soldOut = this.menu[this.currentCategory][i].isSoldOut;
    await menuApi.updateMenu(this.currentCategory, updatedMenuName, $menuId, soldOut);
    console.log(`${this.currentCategory}의 ${i}에 있는 메뉴 이름을 ${updatedMenuName}으로 수정합니다. 품절 상태는 ${soldOut}입니다.`);
    render();
  }

  //품절 관리
  const soldOutMenu = async (e) => {
    const i = findOutI(e);
    const $menuId = e.target.closest("li").dataset.menuId;
    this.menu[this.currentCategory][i].isSoldOut = !this.menu[this.currentCategory][i].isSoldOut;
    //toggle => 처음에는 undefined여서 반대면 true, 그 다음에는 true 이므로 false로 전환
    
    //서버에 있는 item들의 내용 바꿔주기. 
    const menuName = this.menu[this.currentCategory][i].name;
    const soldOut = this.menu[this.currentCategory][i].isSoldOut;
      // 현 인스턴스에는 제대로 저장되어 있는데, 서버에 왜 반영이 안될까? 
    await menuApi.updateMenu(this.currentCategory, menuName, $menuId, soldOut);
    console.log(`${i}에 있는 메뉴 품절상태를 ${soldOut}로 수정합니다.`);
    render();
  }

  //메뉴 삭제 
  const removeMenuName = async (e) => {
    if (confirm("Do you really want to delete the menu?") == true) {
      //problem => 메뉴 아이디로 트랙하면 안됨. 그것보다는 이벤트가 발생한 List가 전체 UL에서 몇번째인지가 나와야 함 => indexof method?
      //현재 '삭제' 클릭한 리스트 확보
      let i = findOutI(e);
      console.log(`${i}에 있는 메뉴를 삭제합니다.`);
      const $menuId = e.target.closest("li").dataset.menuId;
      this.menu[this.currentCategory].splice(i, 1);
      await menuApi.removeMenu(this.currentCategory, $menuId);
      
      render();

    } else {
      return;
    }
  };


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

  // 네비게이션할 때 렌더하기
  const navRender = async (e) => {
    const isCategoryButton =
    e.target.classList.contains("cafe-category-name");
    if (isCategoryButton) {
    this.currentCategory = e.target.dataset.categoryName;
    $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
    this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
    console.log(this.currentCategory);
    console.log(this.menu[this.currentCategory]);
    render();
  }
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
      navRender(e);
    });
  };

};

// new => 하나의 함수로 여러 instance를 만듬? 함수를 모델로 새로운 객체들이 여러개 만들어질 수 있으며 각각의 상태를 가질 수 있다. 
//채팅창이 여러 개 띄워진 사이트들 => 채팅 창 하나하나가 각각의 인스턴스들. 
const app = new App();

//app 이라는 객체가 생성되고 그 객체의 init이라는 메서드를 불러옴 불러와서 위의 로직이 실현될 수 있도록.
app.init();



