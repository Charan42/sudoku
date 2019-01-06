import React from 'react' ;


const box = (props) =>{
    console.log(props);

    let columns = [1,2,3,4,5,6,7,8,9];
    let boxes = columns.map(column =>{
        let rows = [1,2,3,4,5,6,7,8,9];
        let singleColumn = rows.map(row =>{
            let arr = [column, row]
            return (
                <input type="number" onChange={props.Validate} name={arr} key={arr} min="1" max="9"></input>
            )

        })
        return (<div key={column} className="sudoko_row">{singleColumn}</div>)

    }) 
    return boxes
}

const Boxes = (props) => {
    return(
        <div className="sudoko">{box(props)}</div>
    )
}

export default Boxes
