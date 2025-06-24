import { gql, useQuery } from '@apollo/client'

const Authors = (props) => {

  const query = gql`
  query {
    allAuthors {
      bookCount
      born
      name
      id
    }
  }
`

  const result = useQuery(query)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }
  const authors = result.data.allAuthors //was attempting to push result.data.allAuthors on authors 

  return (
    <div>
      <h2>authors</h2>
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
  )
  }

  export default Authors
