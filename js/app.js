const key1 ='65da4b50cc140eb4ebbc39b8a4cf4c89';
const key2 ='d93f5458806aa79ab5607b733d2a8960';
const key3 ='d8d8216665dedaf7eba2264a159c7152';

let userInput;

//בודק את אינפוט של המשתמש 
function searchRecipes(){
   userInput = $('#searchInput').val(); 
   if (userInput){
        $.ajax({
            url: `https://www.food2fork.com/api/search?key=${key1}&q=${userInput}`,
            type: "GET",
            dataType: "json",
            error: function(jqXHR, textStatus, errorThrown) {
                alert('request failed');
            },
            success: function(result){
                const recipeArray = result.recipes;
                $('#searchInput').val('');
                if(recipeArray.length > 0){
                    renderResults(recipeArray);
                }else{
                    $('.search--result--p').text(`No results for "${userInput}", try different search word`);  
                }
            }
        });  
   }else{
       alert('you need to fill the input to search for recipes');
   }
};

//אם האינפוט תקין זה שולף מאייפיאיי 30 תוצאות ואני מציגה את זה בצורת רשימה באתר
function renderResults(arr){
    $('#results').empty();
    $('.search--result--p').text(`you searched for "${userInput}" recipes`);
    $('#recipe').empty();
    $.each(arr, function( index, value ) {
    $('#results').append(`<li class="result--list--item" id="item-${value.recipe_id}">
            <img src="${value.image_url}" class="result--list--img">
            <h2 class="result--list--title">${value.title}</h2>
        </li>`);
    });
};
  
$(document).ready(function() {

    localStorage.clear(); //מנקה את לוקל סטורג בטעינה של הדף
    //כאשר משתמש לוחץ על מתכון מסוים יש קריאה נוספת של אייפיאיי לפי האיי די של המתכון
    $('#results, .header--favorites--list').on('click', function(e) {
            const li = e.target.closest('.result--list--item');
            if (li){
                $('.result--list--item').removeClass('active--item');
                const id = li.id;
                const ids = id.split('-');
                $(`#item-${ids[1]}`).addClass(' active--item');
                $.ajax({
                    url: `https://www.food2fork.com/api/get?key=${key1}&rId=${ids[1]}`, 
                    success: function(result){
                        const obj = jQuery.parseJSON( result );
                        const recipe = obj.recipe
                        renderRecipe(recipe, ids[1]);
                    }, error: function(jqXHR, textStatus, errorThrown) {
                        alert('request failed');
                    }
                }); 
            }   
        });

        $('.search').keydown(function(e) {
            let key = e.which;
            if (key == 13) {
                $('#myBtn').click(); 
            }
        });

});
//טעינה של מתכון והצגה באתר
function renderRecipe(recipe, id){
    const width = window.innerWidth;
    if (width > 768){       //תצוגה לדסקטופ
        $('#recipe').empty();
        $('#recipe').append(`
            <div class="recipe--view--pc">
                <figure class="recipe--fig">
                    <img src="${recipe.image_url}" class="recipe--img">
                    <h1 class="recipe--title">${recipe.title}</h1>
                </figure>
                <div class="recipe--details">
                    <a href="${recipe.publisher_url}" class="recipe--author">${recipe.publisher}</a>
                    <a id="like-${id}" class="addtoFavs"><i class="${localStorage.getItem('recipe-'+id)  ? 'fas' : 'far'} fa-star"></i></a>
                </div>
                <ul class="recipe--ingeridients">
                        ${renderIng(recipe.ingredients)}
                </ul>
                <div class="recipe-links">
                    <a href="${recipe.source_url}" class="recipe--link btn" target="_blank"><i class="fas fa-external-link-alt"></i>go to recipe</a>
                    <button id="buttonAdd" class="recipe-add btn" ><i class="fas fa-shopping-cart"></i>add to shopping list</button>
                </div>
            </div>
        `)
        document.getElementById("buttonAdd").addEventListener("click", function() {
            addToShopping(recipe.ingredients);
        });
        
} else { //תצוגה למובייל 
        $('.recipe--view--mobile').hide();
        $(`#item-${id}`).after(`
        <div class="recipe--view--mobile" id="recipe-${id}">
            <figure class="recipe--fig">
            <img src="${recipe.image_url}" class="recipe--img">
            <h1 class="recipe--title">${recipe.title}</h1>
            </figure>
            <div class="recipe--details">
                <a href="${recipe.publisher_url}" class="recipe--author">${recipe.publisher}</a>
                <a id="like-${id}" class="addtoFavs"><i class="${localStorage.getItem('recipe-'+id) ? 'fas' : 'far'} fa-star"></i></a>
            </div>
           <ul class="recipe--ingeridients">
                ${renderIng(recipe.ingredients)}
            </ul>
            <div class="recipe-links">
                <a href="${recipe.source_url}" class="recipe--link btn" target="_blank"><i class="fas fa-external-link-alt"></i>go to recipe</a>
            </div>
        </div>`);
        $(`recipe-${id}`).show();        
    }
    // בדיקה האם המתכון במעודפים או לא
    $(`#like-${id}`).on('click', function() {
        if($(`#like-${id} .fa-star`).hasClass('far')){
            $(`#like-${id} .fa-star`).removeClass('far').addClass('fas');
            addToFav(id, recipe.image_url, recipe.title);
            checkLikes();
        }else{
            $(`#like-${id} .fa-star`).removeClass('fas').addClass('far');
            deleteFromFav(id);
            checkLikes();
        }
    });
}

// מעבר על רשימת מרכיבים והצגתם למשתמש בצורה ברורה
function renderIng(arr) {
    let Ingeridients = "";
    for (i=0; i < arr.length; i++){
        const item = arr[i].replace(/\(|\)/g, ' ').toLowerCase();
        if(item.match(/[a-z]/i) ) {
            if (item.startsWith("for")){
                if(item.includes(':')){
                const newItem = item.split(':');
                    if(newItem[1]){
                        Ingeridients += `<li class="ingridients-item bold">${newItem[0]}</li>
                        <li class="ingridients-item"><i class="fas fa-utensils"></i>${newItem[1]}</li>`; 
                    }
                    else{
                        Ingeridients += `<li class="ingridients-item bold">${newItem[0]}</li>`;  
                    }          
                }else{
                    Ingeridients += `<li class="ingridients-item bold">${item}</li>`
                }
            }else{
                Ingeridients += `<li class="ingridients-item"><i class="fas fa-utensils"></i>${item}</li>`
            }
        }
    }
    return Ingeridients;

}
//טעינת רשימת קניות
function addToShopping(arr) {
    $('#buttonAdd').prop('disabled', true);
    let shoppingList = [];
    for (i=0; i < arr.length; i++){
        const item = arr[i].toLowerCase().replace(/\(|\)/g, ' ');
        if(item.match(/[a-z]/i) ){
            if(item.length < 60){
                if (!(item.startsWith("for"))){
                    if (!(item.includes("salt and pepper"))){
                        shoppingList.push(item); 
                    }   
                }
            }
        } 
    }
    return renderShopping(shoppingList);
}

//הצגת רשימת קניות באתר
function renderShopping(arr){
    $(".shop-title").css("display", "block");
        $.each(arr, function( index, item ) {
            $('.shoppingList--ul').append(`<li class="shopping__item">${item}<span class="close">x</span></li>`);
        });  
        $(".close").on("click", function(e) {
            const li = e.target.closest('.shopping__item');
            li.remove();
        });
    
         addDeleteBtn(arr);
}

//מציג כפתור אשר מוחק את כל רשימת הקניות (מוצג רק אם יש ברשימה משהו)
 function addDeleteBtn(arr){
     if (arr.length > 0 && $('.delete_btn').length == 0 ){
         $('#shoppingList').append(`<button class="delete_btn btn" onclick="deleteShoppingList()">clear list</button>`);
     }

 }
 // מוחק רשימת קניות
 function deleteShoppingList() {
     $('.shoppingList--ul').html('');
     $('.delete_btn').remove();
     $('#buttonAdd').prop('disabled', false);

 }
//בודק אם יש מתכונים במועדפים ואם יש הכפתור משנה נראות
 function checkLikes() { 
    if(localStorage.length > 0){
        if($('.header--favorites .fa-star').hasClass('far')){
            $('.header--favorites .fa-star').removeClass('far').addClass('fas');
        }
    }else{
        if($('.header--favorites .fa-star').hasClass('fas')){
            $('.header--favorites .fa-star').removeClass('fas').addClass('far');
        }
    }   
 };

 //מוסיף מתכון לוקל סטורג
function addToFav(id, image, title){
    const favRecipe = {id,image,title};
    if (localStorage.getItem(`recipe-${favRecipe.id}`) === null) {
        localStorage.setItem(`recipe-${favRecipe.id}`,JSON.stringify(favRecipe));
    }
    showFavs(favRecipe);
}

//מוחק מתכון מלוקל סטורג' ומהמועדפים באתר
function deleteFromFav(id){
    if (localStorage.getItem(`recipe-${id}`)) {
        localStorage.removeItem(`recipe-${id}`)
    }
    if($(`#fav-${id}`).length){
        const deleteItem = document.getElementById(`fav-${id}`);
        deleteItem.parentNode.removeChild(deleteItem);
    }
}

//מוסיף מועדפים לאתר
function showFavs(recipe){
      if(!($(`#fav-${recipe.id}`).length)){
        const html =`
        <li class="result--list--item" id="fav-${recipe.id}">
                    <img src="${recipe.image}" class="result--list--img">
                    <h4 class="result--list--title">${recipe.title}</h4>
        </li>`;
        $('.header--favorites--list').append(html);
    }
}
