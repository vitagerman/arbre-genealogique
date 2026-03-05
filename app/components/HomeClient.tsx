"use client";

import Link from "next/link";

interface People {
  _id: string;
  name: string;
  surname?: string;
  birthdate: string | null;
  deathdate: string | null;
  createdAt: string;
}

interface Props {
  people: People[];
}

export default function HomeClient({ people }: Props) {
  return (
    <div>
      <Link href="/create-people">
        <button>Créer une personne</button>
      </Link>

      <Link href="/create-user">
        <button>Créer un compte</button>
      </Link>

       <h1>Liste des personnes :</h1>

      <ul>
        {people.map((person) => (
          <li key={person._id}>
            {person.name} - {person.surname || "—"} -{" "}
            {person.birthdate ? new Date(person.birthdate).toLocaleDateString() : "—"} -{" "}
            {person.deathdate ? new Date(person.deathdate).toLocaleDateString() : "—"} -{" "}
            {new Date(person.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}