import React, { useEffect, useState, useContext } from 'react';
import httpClient from '../httpClient';
import { UserContext } from '../UserContext';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get("http://localhost:3001/check_user");
        setUser(response.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, [setUser]);
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await httpClient.get('http://localhost:3001/get_todo', {
          params: { user_id: user.id }, // testing purposes
        });
        setTodos(response.data.todos);
      } catch (error) {
        console.error('Error fetching To-Do list:', error);
      }
    };
  
    fetchTodos();
  }, []);

  const handleCompletionChange = (todoId, completed) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, completed } : todo
    );
    setTodos(updatedTodos);
    httpClient.post('http://localhost:3001/update_todo', { id: todoId, completed });
  };

  return (
    <div>
    <h2>Your To-Do List</h2>
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="radio"
            checked={!!todo.completed}
            onChange={() => handleCompletionChange(todo.id, !todo.completed)}
          />
          {todo.course_title}
        </li>
      ))}
    </ul>
  </div>
  );
};

export default TodoList;
