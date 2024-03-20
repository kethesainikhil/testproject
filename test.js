const obj = [
    {
      "id": 1,
      "username": "kethe sai nikhil",
      "stdin": "1 2 3 4 5",
      "sourcecode": "public class Main{\npublic static void main(String [] args){\nSystem.out.println(\"hello world\");\n}\n}",
      "language": "java",
      "timestamp": "Mar 19 2024 18:57:26"
    },
    {
      "id": 2,
      "username": "second entry",
      "stdin": "second entry",
      "sourcecode": "jksl",
      "language": "c++",
      "timestamp": "Mar 19 2024 19:9:3"
    }
  ]

  obj.map((item) => {
      console.log(item)
  })