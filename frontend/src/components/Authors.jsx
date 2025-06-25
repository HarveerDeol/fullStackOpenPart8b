import { gql, useQuery, useMutation } from '@apollo/client'
import { set } from 'mongoose'
import { useState } from 'react'

export const EDIT_BIRTHYEAR = gql`
mutation Mutation($name: String!, $setBornTo: Int!) {
  editAuthor(name: $name, setBornTo: $setBornTo) {
    name
    id
    born
  }
}
`


const query = gql`
query {
  allAuthors {
    born
    name
    id
  }
}
`

const Authors = (props) => {
  const [changeBirthYear] = useMutation(EDIT_BIRTHYEAR, {
    refetchQueries: [ { query: query } ]
  })
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [birthYear, setBirthYear] = useState('')

  const result = useQuery(query)
  if (!props.show) {
    return null
  } else if (result.loading) {
    return <div>loading...</div>
  }
  const authors = result.data.allAuthors //was attempting to push result.data.allAuthors on authors 

  const submit = async (event) => {
    event.preventDefault()

    changeBirthYear({ variables: { name:selectedAuthor, setBornTo:birthYear } })
    setBirthYear('')
    setSelectedAuthor('')
  }

  return (
    <div>
      <h2>authors</h2>
      <div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>

        <select value={selectedAuthor}
      onChange={(e) => setSelectedAuthor(e.target.value)}>

          <option value=''>select</option>
          {authors.map((a)=>(<option key={a.id} value={a.name}>{a.name}</option>))}

        </select>

        <br></br>

        <label htmlFor='birth'>Birthyear: </label>
        <input type='number' name='birth' onChange={({target}) => setBirthYear(Number(target.value))}/>

        <br></br>

        <button type="submit">Submit</button>

        </form>
      </div>
    </div>
  )
  }

  export default Authors
