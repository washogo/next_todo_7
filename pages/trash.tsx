import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Flex,
  HStack,
  Button,
  Text,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useRecoilValue } from 'recoil';
import { userState } from '../Atoms/userAtom';
import { Todo } from './top';
import parseTimestampToDate from '../utils/parseTimestampToDate';
import ConfirmationDialog from '../components/ConfirmationDialog';

//単一削除
export const handleDeleteData: (id: string) => void = async (id) => {
  console.log(id);
  await deleteDoc(doc(db, 'todos', id))
    .then(() => alert('データが削除されました'))
    .catch((err) => {
      alert(err.message);
    });
};

const Trash = () => {
  const router = useRouter();
  const uid = useRecoilValue(userState).uid;
  const [deleteTodoId, setDeleteTodoId] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>();
  const [dialogText, setDialogText] = useState('');
  const [dialogFunc, setDialogFunc] = useState({ fn: () => {} });

  //削除よてい
  // const initialTodos = [
  //   {
  //     id: '1',
  //     task: 'test1',
  //     status: 'DONE',
  //     priority: 'High',
  //   },
  // ];
  const [todos, setTodos] = useState<Todo[]>([]);

  //ログイン確認
  useEffect(() => {
    if (!uid) {
      router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //使っていない。最後に削除予定
  // useEffect(() => {
  //   auth.onAuthStateChanged(async (user) => {
  //     console.log(user);
  //     if (user) {
  //       getTodos();
  //     } else {
  //       router.push('/login');
  //     }
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  //レンダリング及びtodo更新時にDBからTrashデータ取得（DB上限で一時的にコメントアウト）
  useEffect(() => {
    const getTodosQuery = query(
      collection(db, 'todos'),
      where('category', '==', 'trash')
      // where("author", "==", uid), // 自分のTodoのみ表示させる場合はこの行を追加
      // orderBy('create', 'desc')
    );
    const unsubscribe = onSnapshot(getTodosQuery, (querySnapshot) => {
      const getTodos: Todo[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        task: doc.data().task,
        status: doc.data().status,
        priority: doc.data().priority,
        create_date: doc.data().create,
      }));
      setTodos(getTodos);
    });
    return () => unsubscribe();
  }, []);

  //単一リストア
  const handleRestoreData: (id: string) => void = async (id) => {
    await updateDoc(doc(db, 'todos', id), {
      category: 'top',
    });
  };

  //削除（確認）
  const handleDeleteConfirmation: (id: string) => void = (id) => {
    setDeleteTodoId(id);
    setDialogText('UNIT_DELETE');
    // setDialogFunc({ fn: () => handleDeleteData(deleteTodoId) });
    onOpen();
  };

  //一括削除（確認）
  const handleAllDeleteConfirmation: () => void = () => {
    setDialogFunc({ fn: () => handleDleteAllData });
    setDialogText('ALL_DELETE');
    onOpen();
  };

  // 一括削除
  const handleDleteAllData: () => void = () => {
    if (todos === null) return;
    todos.map(async ({ id }) => {
      await deleteDoc(doc(db, 'todos', id)).catch((err) => {
        alert(err.message);
      });
    });
    console.log(todos);
  };

  return (
    <>
      <Container p="110px 100px 0" w="100%" maxW="1080px">
        <Flex justify="space-between">
          <Text
            fontSize="28px"
            fontWeight="700"
            color="blackAlpha.800"
            lineHeight="33px"
          >
            TRASH
          </Text>
          <Flex justify="end" align="center">
            <Button
              color="white"
              variant="outline"
              bgColor="red.500"
              w="112px"
              h="40px"
              borderRadius="3xl"
              fontSize="18px"
              fontWeight="bold"
              onClick={() => handleAllDeleteConfirmation()}
            >
              Delete all
            </Button>
            <Button
              color="white"
              variant="outline"
              bgColor="blue.300"
              w="112px"
              h="40px"
              borderRadius="3xl"
              fontSize="18px"
              fontWeight="bold"
              ml="24px"
            >
              Restore all
            </Button>
            <Button
              color="black"
              variant="outline"
              bgColor="green.300"
              w="112px"
              h="40px"
              borderRadius="50px"
              borderColor="black.700"
              fontSize="18px"
              fontWeight="bold"
              ml="24px"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </Flex>
        </Flex>
        <TableContainer w="100%" m="33px 0 16px">
          <Table>
            <Thead h="56px" bg="green.300">
              <Tr>
                <Th
                  fontSize="24px"
                  color="blackAlpha.800"
                  textTransform="none"
                  textAlign="left"
                  p="0 0 0 10px"
                  minW="100px"
                >
                  Task
                </Th>
                <Th
                  fontSize="24px"
                  color="blackAlpha.800"
                  textTransform="none"
                  textAlign="center"
                  p="0"
                  minW="100px"
                >
                  Status
                </Th>
                <Th
                  fontSize="24px"
                  color="blackAlpha.800"
                  textTransform="none"
                  textAlign="center"
                  p="0"
                  minW="100px"
                >
                  Priority
                </Th>
                <Th
                  fontSize="24px"
                  color="blackAlpha.800"
                  textTransform="none"
                  textAlign="center"
                  p="0"
                  minW="100px"
                >
                  Create
                </Th>
                <Th
                  fontSize="24px"
                  color="blackAlpha.800"
                  textTransform="none"
                  textAlign="center"
                  p="0"
                  minW="100px"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {todos.map((todo) => {
                return (
                  <>
                    <Tr key={todo.id}>
                      <Td textAlign="left" pl="10px">
                        {todo.task}
                      </Td>
                      <Td textAlign="center">
                        <Box
                          w="120px"
                          h="40px"
                          lineHeight="40px"
                          textAlign="center"
                          borderRadius="50px"
                          bg={
                            todo.status === 'DOING'
                              ? 'green.600'
                              : todo.status === 'DONE'
                              ? 'green.300'
                              : 'green.50'
                          }
                          color={
                            todo.status === 'DOING'
                              ? 'green.50'
                              : 'blackAlpha.800'
                          }
                          fontWeight="bold"
                        >
                          <Text>{todo.status}</Text>
                        </Box>
                      </Td>
                      <Td
                        w="174px"
                        h="56px"
                        color="green.100"
                        textAlign="center"
                        fontSize="16px"
                        letterSpacing="0.3em"
                        fontWeight="medium"
                        lineHeight="40px"
                        textShadow="1px 1px 0 black, -1px -1px 0 black,
											-1px 1px 0 black, 1px -1px 0 black,
											0px 1px 0 black,  0 -1px 0 black,
											-1px 0 0 black, 1px 0 0 black;"
                      >
                        {todo.priority}
                      </Td>
                      <Td fontSize="14px" textAlign="center">
                        {parseTimestampToDate(todo.create_date, '-')}
                      </Td>
                      <Td>
                        <HStack spacing="16px" justify="center">
                          <Button
                            color="white"
                            variant="outline"
                            bgColor="red.500"
                            w="80px"
                            h="40px"
                            borderRadius="3xl"
                            fontSize="18px"
                            fontWeight="bold"
                            p="0"
                            // onClick={(e) => handleDeleteData(e, todo.id)}
                            onClick={() => handleDeleteConfirmation(todo.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            color="white"
                            variant="outline"
                            bgColor="blue.300"
                            w="80px"
                            h="40px"
                            borderRadius="3xl"
                            fontSize="18px"
                            fontWeight="bold"
                            p="0"
                            onClick={
                              (() => onClose(),
                              () => {
                                handleRestoreData(todo.id);
                              })
                            }
                          >
                            Restore
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                    <ConfirmationDialog
                      isOpen={isOpen}
                      onClose={onClose}
                      cancelRef={cancelRef}
                      deleteTodoId={deleteTodoId}
                      dialogText={dialogText}
                      // onClick={dialogFunc.fn}
                    />
                    {/* <AlertDialog
                      isOpen={isOpen}
                      leastDestructiveRef={cancelRef}
                      onClose={onClose}
                    >
                      <AlertDialogOverlay>
                        <AlertDialogContent>
                          <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Todo
                          </AlertDialogHeader>

                          <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                          </AlertDialogBody>

                          <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                              Cancel
                            </Button>
                            <Button
                              colorScheme="red"
                              //複数処理のときは、アローの後を｛関数A,関数B｝にする
                              onClick={() => {
                                handleDeleteData(deleteTodoId), onClose();
                              }}
                              ml={3}
                            >
                              Delete
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialogOverlay>
                    </AlertDialog> */}
                  </>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
        <HStack justify="center" align="center">
          <Box sx={pagenation}>＜</Box>
          <Box sx={pagenation}>1</Box>
          <Box sx={pagenation}>2</Box>
          <Box sx={pagenation}>...</Box>
          <Box sx={pagenation}>5</Box>
          <Box sx={pagenation}>6</Box>
          <Box sx={pagenation}>＞</Box>
        </HStack>
      </Container>
    </>
  );
};

const filterBox = {
  w: '100%',
  minW: '120px',
};
const filterTitle = {
  fontWeight: '700',
  fontSize: '18px',
  lineHeight: '22px',
};
const pagenation = {
  w: '40px',
  h: '40px',
  lineHeight: '40px',
  textAlign: 'center',
  borderRadius: '10px',
  border: '1px solid rgba(0, 0, 0, 0.8)',
  fontSize: '18px',
  color: 'blackAlpha.800',
};

export default Trash;
