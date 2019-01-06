import React, { Component } from 'react';
import Boxes from './boxes/boxes';


class App extends Component {

  errors = '';
   errorsDiv = document.createElement('div');



  checker = (arr, n, rc) => {
    let unique =  arr;
    let sub = 'th';
    unique = unique.map((item,i) => unique.includes(item, i+1) ? item : '' );
    unique = [...new Set(unique)].filter(n => n);
    if(unique.length){
      sub = (n === 1) ? 'st' : (n === 2) ? 'nd' : (n === 3) ? 'rd' : 'th' ;
      this.errors += ' error in ' + n + sub+' '+ rc + `</br>`;
    //  console.log(' error in ' + n + 'th '+ rc);
    }
  }
  rowAndColumnChecker =(a)=>{
    let RC = ['Row', 'Column'];
    for(let k=0; k< RC.length; k++){
      for(let i=0; i< a.length; i++){
        let arr = [];
        for(let j=0; j< a[i].length; j++){
          let num = (RC[k] == 'Row') ?  a[i][j] : a[j][i];
          if(num){arr.push(parseInt(num))}
        }
        this.checker(arr, i+1, RC[k]);
      }
    }

  }

  boxesChecker = (ar) => {
    let A =[[0,1,2],[3,4,5],[6,7,8]];
    let B =[[0,1,2],[3,4,5],[6,7,8]];

    let boxNo = 0;
    A.forEach(a =>{
      B.forEach(b =>{
        boxNo++;
        let arr =[]
        for(let i=0; i<3 ; i++){
          for(let j=0; j<3 ; j++){
            let num = ar[a[i]][b[j]] ;
            if(num){arr.push(parseInt(num));
              let n = a[i];
              let m = b[j];
            }
          }
        }
        this.checker(arr, boxNo, 'box');
      })
    })
  }

  getValues = () =>{
    let sudokoValues = [];
    for(let i=1; i<10; i++){
      let arr = [];
      for(let j=1; j<10; j++){
        let input = "input[name=" + '"' + i + ',' + j +'"]'; 
        let num = document.querySelectorAll( `${input}` )[0].value;
        if(num){arr.push(parseInt(num))
        }else {arr.push(null)}
      }
      sudokoValues.push(arr);
    }
    return(sudokoValues);
    // console.log(sudokoValues);
  }

  onValidate = (e) =>{
    console.time();
    e.preventDefault();

    let sudoko = this.getValues();
    // console.log(sudoko);

    for(let i=0; i< sudoko.length; i++){

      for(let j=0; j< sudoko[i].length; j++){
      //  console.log(sudoko[i][j]);
      }

    }
    this.rowAndColumnChecker(sudoko);
    this.boxesChecker(sudoko);
    let ele = document.querySelectorAll('#message')[0];
    ele.innerHTML = this.errors;
    this.errors = '';
  
console.timeEnd();

  }
  render() {
    return (
      <div className="App">
        <form>
          <Boxes Validate={this.onValidate} />
        </form>
        <div className="message" id="message"></div>
      </div>
    );
  }
}

export default App;
