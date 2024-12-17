class Node {
    constructor(value) {
        this.value = value; // Value of the node
        this.next = null;   // Pointer to the next node
    }
}

export class LinkedList {
    size = $state(0);

    constructor() {
        this.head = null; // Start of the linked list
        this.size = 0;    // Size of the list
    }

    // Add a node at the start (push equivalent for stack)
    insertAtHead(value) {
        const newNode = new Node(value);
        newNode.next = this.head; // Link the new node to the current head
        this.head = newNode;      // Update the head to the new node
        this.size++;
    }

    // Remove a node from the start (pop equivalent for stack)
    removeHead() {
        if (this.isEmpty()) {
            throw new Error("List is empty");
        }
        const value = this.head.value;
        this.head = this.head.next; // Move the head pointer to the next node
        this.size--;
        return value;
    }

    // Peek at the head's value
    peekHead() {
        if (this.isEmpty()) {
            throw new Error("List is empty");
        }
        return this.head.value;
    }

    // Check if the list is empty
    isEmpty() {
        return this.size === 0;
    }

    // Get the size of the list
    getSize() {
        return this.size;
    }
}

export class Stack {
    constructor() {
        this.linkedList = new LinkedList(); // Internally use a linked list
    }

    // Push a value onto the stack
    push(value) {
        this.linkedList.insertAtHead(value); // Insert at the head of the list
    }

    // Pop a value off the stack
    pop() {
        return this.linkedList.removeHead(); // Remove from the head of the list
    }

    // Peek at the top value of the stack
    peek() {
        return this.linkedList.peekHead(); // Peek the head of the list
    }

    // Check if the stack is empty
    isEmpty() {
        return this.linkedList.isEmpty();
    }

    // Get the size of the stack
    size() {
        return this.linkedList.getSize();
    }

    // Clear the stack
    clear() {
        this.linkedList.head = null; // Reset head to null
        this.linkedList.size = 0;    // Reset size to 0
    }
}
