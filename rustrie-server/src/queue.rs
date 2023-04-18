use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Debug)]
pub struct Node<T> {
    value: T,
    created_at: u64,
    next: Option<Box<Node<T>>>,
}

impl<T> Node<T> {
    fn new(value: T) -> Node<T> {
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        Node {
            value,
            created_at,
            next: None,
        }
    }

    fn age(&self) -> Duration {
        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        Duration::from_secs(current_time - self.created_at)
    }
}

pub struct Queue<T> {
    head: Option<Box<Node<T>>>,
    len: usize,
}

impl<T> Queue<T> {
    pub fn new() -> Queue<T> {
        Queue { head: None, len: 0 }
    }

    pub fn enqueue(&mut self, value: T) {
        println!("queuing..");
        let mut new_node = Box::new(Node::new(value));
        if let Some(head) = self.head.take() {
            new_node.next = Some(head);
            self.head = Some(new_node);
        } else {
            self.head = Some(new_node);
        }
        self.len += 1;
    }

    pub fn dequeue(&mut self) -> Option<T> {
        self.head.take().map(|mut head| {
            self.head = head.next.take();
            self.len -= 1;
            head.value
        })
    }

    pub fn peek(&self) -> Option<&T> {
        self.head.as_ref().map(|head| &head.value)
    }

    pub fn peek_time(&self) -> Option<&u64> {
        self.head.as_ref().map(|head| &head.created_at)
    }

    pub fn is_empty(&self) -> bool {
        self.head.is_none()
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn remove_old(&mut self, max_age: Duration) {
        while let Some(curr) = self.head.as_ref() {   // while self.head is not None, we assign
            if curr.age() > max_age {
                self.dequeue();
            } else {
                break;
            }
        }
    }
}
