# unrom

## Product priority

- The **data + API is the product**. The frontend is a neutral access layer whose job is to make the data viewable and usable.
- The **backend data and API must remain fully independent** of the frontend and are the **priority**.
- The **frontend is always second**: it must never become a dependency of the data pipeline, and work on it should not block or reshape the data/API.
