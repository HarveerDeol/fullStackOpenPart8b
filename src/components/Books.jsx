import { gql, useQuery } from '@apollo/client'

const Books = (props) => {
  

  const query = gql`
  query {
    allBooks {
      title
      author
      published
      id
    }
  }
`
const result = useQuery(query)

if (!props.show) {
  return null
} else if (result.loading) {
  return <div>loading...</div>
}
const books = result.data.allBooks 

return (
  <div>
    <h2>books</h2>

    <table>
      <tbody>
        <tr>
          <th></th>
          <th>author</th>
          <th>published</th>
        </tr>
        {books.map((a) => (
          <tr key={a.id}>
            <td>{a.title}</td>
            <td>{a.author}</td>
            <td>{a.published}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
}

export default Books
