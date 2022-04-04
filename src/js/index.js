
import { $ } from './utils/dom.js';
import {menuApi} from './utils/api.js';

function App() {

  //initial status 
  this.init = async () => {
    // => init이라는 async 함수를 정의하는데, 이 함수의 메뉴에서 currentCategory 즉 "espresso"의 value에 해당하는 것(리스트)에다가 
    // => menuApi 객체의 getAllMenuByCategory라는 메소드를 사용해라. 메소드의 입력값은 this.currentcategory(즉 "espresso")
    // => 렌더함수 실행해주고, initEventListners 실행해줘라. 

    // => 새로 생성되는 객체 instance의 menu를 위와 같은 형태로 생성함. 
    this.menu = {
      espresso: [],
      frappuccino: [],
      blended: [],
      teavana: [],
      desert: [],
    };
    // => 처음 생성되는 객체의 currentCategory 디폴트 값은 espresso로.
    this.currentCategory = "espresso"; 
  
    this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
    render();
    initEventListners();
  }
  
  //rendering
  const render = async () => {
    console.log(`${this.currentCategory} 에 있는 아이템들을 렌더합니다.`);
    this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
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

  //이벤트 바인딩
  const initEventListners = () => {
    //입력 누를 때 디폴트 실행값 멈춰주기. 폼 태그가 입력값을 자동으로 전송하는 것을 막아주는 함수를 정의함.
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    //확인 입력
    $("#menu-submit-button").addEventListener("click", addMenuName);

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

    //네비게이션
    $("nav").addEventListener("click", (e) => {
      navRender(e);
    });
  };

//메뉴 생성, 수정, 삭제, 품절 관리 등의 기능들

  //생성 
  const addMenuName = async (e) => {
    //input 값이 없으면, "값을 넣어 주세요" 출력함.
    if ($("#menu-name").value === ""){
        alert("Please enter a value.");
        return;
    }
    //menuApi의 createMenu method 실행. 입력값은, 현 카테고리와 입력값. 
    await menuApi.createMenu(this.currentCategory, $("#menu-name").value);
    render();
    $("#menu-name").value = "";
  };

  //메뉴 수정
  const updateMenuName = async (e) => {
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const $menuId = e.target.closest("li").dataset.menuId;
    // event object 의 타겟속성에 closest method 적용. 거기에 다시 querySelector method 적용.=> 이벤트가 발생한 object에서 가장 가까운 li에서 menu-name이라는 클래스를 찾아라. (.은 class #은 id))
    const updatedMenuName = prompt("Change the menu", $menuName.innerText);
    await menuApi.updateMenu(this.currentCategory, updatedMenuName, $menuId);
    render();
  }

  //품절 관리
  const soldOutMenu = async (e) => {
    const $menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name").innerText; 
    this.menu[this.currentCategory].find(x => x.name == $menuName).isSoldOut = !this.menu[this.currentCategory].find(x => x.name == $menuName).isSoldOut;
    const soldOut = this.menu[this.currentCategory].find(x => x.name == $menuName).isSoldOut;
    await menuApi.soldOutMenu(this.currentCategory, $menuId, soldOut);
    render();
   }

  //메뉴 삭제 
  const removeMenuName = async (e) => {
    if (confirm("Do you really want to delete the menu?") == true) {
      
      const $menuName = e.target.closest("li").querySelector(".menu-name");
      const $menuId = e.target.closest("li").dataset.menuId;
      await menuApi.removeMenu(this.currentCategory, $menuId);
      render();
    } else {
      return;
    }
  };

  //메뉴 수 카운트
  const updateMenuCount = () => {
    let menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount}개`;
  }

  // 네비게이션
  const navRender = async (e) => {
    const isCategoryButton =
    e.target.classList.contains("cafe-category-name");
    if (isCategoryButton) {
     this.currentCategory = e.target.dataset.categoryName;
      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
      this.menu[this.currentCategory] = await menuApi.getAllMenuByCategory(this.currentCategory);
      render();
    }
  }
};

// new => 하나의 함수로 여러 instance를 만듬? 함수를 모델로 새로운 객체들이 여러개 만들어질 수 있으며 각각의 상태를 가질 수 있다. 
//채팅창이 여러 개 띄워진 사이트들 => 채팅 창 하나하나가 각각의 인스턴스들. 
const app = new App();

//app 이라는 객체가 생성되고 그 객체의 init이라는 메서드를 불러옴 불러와서 위의 로직이 실현될 수 있도록.
app.init();



