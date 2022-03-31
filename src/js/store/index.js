
const store = {
setLocalStorage(menu) {
    localStorage.setItem("menu", JSON.stringify(menu));
    //로컬 스토리지에는 string 형태로만 저장되므로, strongify method를 통해 문자열로 변환한 뒤 저장해야 한다.
},
getLocalStorage() {
    return JSON.parse(localStorage.getItem("menu"));
    //로컬 스토리지에 문자로 저장된 데이터를 다시 JSON 객체로 인식함.
},
};

export default store;