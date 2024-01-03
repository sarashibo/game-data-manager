import { useState, useEffect } from "react";
import './App.css';
import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
  Button,
  Heading,
  View,
  Flex,
  Text, 
} from "@aws-amplify/ui-react";
import { signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import {  } from 'aws-amplify/storage';

import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { GraphQLResult } from '@aws-amplify/api-graphql'


function App() {

  const onClickSignOut = async () => {
    await signOut()
  }

  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState<Note>({
    description: "",
    name: "My first todo!"
  });
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const client = generateClient();


  const fetchNotes = async () => {
    const apiData = await client.graphql({ query: listNotes }) as GraphQLResult<FetchNote>;
    const notesFromAPI = apiData.data.listNotes.items;
    setNotes(notesFromAPI);
  }

  type FetchNote = {
    listNotes: {
      items: Note[]
    }

  }
  type Note = {
    id?: string
    description: String
    name: string
  }
  const createNote = async () => {

   await client.graphql({
      query: createNoteMutation,
      variables: {
        input: {
          name: note.name,
          description: note.description
        }
      }
    }) as GraphQLResult<Note>;



  }

  const deleteNote = async (id?: string) => {
    if (!id) return;
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  const setName = (name: string) => {
    const input = {
      description: note.description,
      name
    } as Note;
    setNote(input)

  }
  const setDescription = (description: string) => {

    const input = {
      name: note.name,
      description
    } as Note;
    setNote(input)

  }
  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0">
        <Flex direction="row" justifyContent="center">
          <input
            placeholder="Note Name"
            onChange={(event) => {
              setName(event.target.value)
            }

            } />
          <input
            placeholder="Note Description"
            onChange={(event) => {
              setDescription(event.target.value)
            }

            } />

          <Button variation="primary" onClick={() => {
            createNote().finally(fetchNotes)
          }}>
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Button variation="link" onClick={() => deleteNote(note.id)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={onClickSignOut}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);

