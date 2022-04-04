
// URL 계속 재사용되므로 입력해놓기
const BASE_URL = "http://localhost:3000";

export const menuApi = {
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
  ,async updateMenu(category, name, id){
      const response =  await fetch(`${BASE_URL}/api/category/${category}/menu/${id}`, {
        method : "PUT", 
        headers : {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify({name}),
      });
  }
  ,async soldOutMenu(category, id, isSoldOut){
    const response = await fetch(`${BASE_URL}/api/category/${category}/menu/${id}/soldout`, {
      method : "PUT", 
      headers : {
        "Content-Type" : "application/json",
      },
      body: JSON.stringify({isSoldOut}),
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
}