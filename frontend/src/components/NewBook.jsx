import { useState } from 'react'
import {gql, useMutation,  } from '@apollo/client'


const CREATE_AUTHOR = gql`
mutation Mutation($title: String!, $author: String!, $genres: [String!]!, $published: Int) {
  addBook(title: $title, author: $author, genres: $genres, published: $published) {
    title
    author {
      name
    }
    genres
    published
  }
}
`
const queries = gql`
query {
  allAuthors {
    born
    name
    id
  }
  allBooks {
    title
    author {
      name
    }
    published
    id
  }
}
`

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [ createAuthor ] = useMutation(CREATE_AUTHOR, {
    refetchQueries: [ { query: queries } ]
  })

  if (!props.show) {
    return null
  }


  const submit = async (event) => {
    event.preventDefault()

    createAuthor({  variables: { title, author, published, genres } })


    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook