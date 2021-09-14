import React from "react";
import "./App.css";

import "firebase/firestore";
import "firebase/auth";

// messy imports, was just playing around with stuff
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

//Table imports
import BootstrapTable from "react-bootstrap-table-next";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const config = require("./config.json");

// find in firebase ... will set up secrets later
initializeApp(config.firebaseConfig);

const auth = getAuth();
const firestore = getFirestore();

var fdc = 0;

function App() {
  const [user] = useAuthState(auth);

  const [fdcid_input, setFdcid] = useState(" ");
  const [recipe_nameInput, setRecipe_name] = useState(" ");

  const handle_fdcid = event => {
    setFdcid(event.target.value);
  };
  
  const handleRecipeName = event =>{
    setRecipe_name(event.target.value);
  };
  fdc = fdcid_input;


  return (
    <div className="App">
      <header className="App-header">Food Fanatic{user ? <SignOut /> : <SignIn />}</header>
      <section>{user ? <Recipes /> : <p>Sign In to View Recipes</p>}</section>
      <section>{user ? <Ingredients />: <p> </p>}</section>
      <section>{user ? <input className = "e-input" type = "text" placeholder = "Enter Fdcid"/>: <p> </p>} </section>
      <section>{user ? <input className = "e-input" type = "text" placeholder = "Enter name of Recipe" />: <p> </p>} </section>
      <section>{user ?<button onClick ={AddRecipeToCloud}> Add New Recipe to list </button>: <p> </p>} </section>
    </div>
  );
}


function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>;
}

async function getRecipes() {
  const querySnapshot = await getDocs(collection(firestore, "users", auth.currentUser.uid, "recipes"));
  let recipes = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    recipes.push({ id: doc.id, data: doc.data() });
  });
  return recipes;
}

const getIngredientData = async () => {
  var foodId = 534358; // example food id for beans
  var response = await fetch(`${config.fdcConfig.url}/${foodId}?limit=1&api_key=${config.fdcConfig.apiKey}`)
  .then(response => response.json())
  var jsonData = response;
  return jsonData;
};


const AddRecipeToCloud = async () => {
};


function Ingredients() {
  let [ingredients, setIngredients] = useState(null);
  // need to find a way to limit the amount of fetches cleanly...can't overload
  let [fetchingIngredients, setFetchingIngredients] = useState(null);
  if (!fetchingIngredients) {
    setFetchingIngredients(1);
    getIngredientData().then((ingredients) => {
      // trying out stuff with the API
      getIngredientData().then((jsonData) => {console.log(jsonData)});
      const ingredient_data = [{name: ingredients.description, class: ingredients.labelNutrients.calories.value}];
      const ingredient_columns = [{dataField: 'name', text: 'Ingredient Name'},{dataField: 'class', text:'Calories (kcal)'}];
      const ingredientTable = (
        <div id="Ingredients">
          <h1>Ingredients</h1>
            <BootstrapTable keyField = 'name' data ={ingredient_data} columns = {ingredient_columns}/>
        </div>
      );
      setIngredients(ingredientTable);
    });
  }
  return ingredients;
}






function Recipes() {
  let [recipes, setRecipes] = useState(null);
  // need to find a way to limit the amount of fetches cleanly...can't overload
  let [fetchingRecipes, setFetchingRecipes] = useState(null);
  if (!fetchingRecipes) {
    setFetchingRecipes(1);
    getRecipes().then((recipes) => {
      // trying out stuff with the API
       //getIngredientData().then((jsonData) => {console.log(jsonData)});
      const recipesTable = (
        <div id="recipes">
          <h1>Your Recipes</h1>
          <table id="recipesTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((item) => (
                <tr key={item.id}>
                  <td>{item.data.name}</td>
                  <td>{item.data.cal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      setRecipes(recipesTable);
    });
  }
  return recipes;
}

export default App;
