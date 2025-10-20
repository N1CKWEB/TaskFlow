import styled from "styled-components/native";

export  function Componente(){
  return(

    <Container>
    
    <Texto>Componente</Texto>
    
    </Container>
  )
}
const Container=styled.View`
  flex:1;
  align-items:center;
  justify-content:center;
  
`
const Texto=styled.Text`
  color:red;
`