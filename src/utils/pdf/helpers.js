export function currency(v){

    return Number(v||0).toLocaleString(

        "pt-BR",

        {

            style:"currency",

            currency:"BRL"

        }

    )

}

export function percent(value){

    return `${value.toFixed(2)}%`

}

export function today(){

    return new Date()

        .toLocaleString("pt-BR")

}