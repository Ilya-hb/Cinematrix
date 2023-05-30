import Navbar from "@/components/Navbar";
import { Genre, Movie, Element } from "@/typings";
import requests from "@/utils/requests";
import { NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ReactPlayer from "react-player/lazy";

interface MovieProps {
  id: string;
  movie: Movie;
}

const MoviePage: NextPage<MovieProps> = ({ id, movie }) => {
  const [trailer, setTrailer] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    if (!movie) return;
    async function fetchMovie() {
      const data = await fetch(
        `https://api.themoviedb.org/3/${
          movie?.media_type === "tv" ? "tv" : "movie"
        }/${movie?.id}?api_key=${
          process.env.NEXT_PUBLIC_THEMOVIEDB_API_KEY
        }&language=en-US&append_to_response=videos`
      )
        .then((response) => response.json())
        .catch((err) => console.log(err.message));

      if (data?.videos) {
        const index = data.videos.results.findIndex(
          (element: Element) => element.type === "Trailer"
        );
        setTrailer(data.videos?.results[index]?.key);
      }
      if (data?.genres) {
        setGenres(data.genres);
      }
    }

    fetchMovie();
  }, [movie]);

  console.log(trailer);

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3">
            {/* Left Column - Movie Poster and Details */}
            <div className="mb-6">
              <Image
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                width={300}
                height={450}
                className="rounded-lg"
              />
            </div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>

              {movie?.tagline ? (
                <p className="text-white text-lg">Tagline: {movie.tagline}</p>
              ) : (
                ""
              )}
              <p className="text-white text-lg">
                Release Date: {movie.release_date}
              </p>
              <p className="text-white text-lg">
                Average Rating: {movie.vote_average}
              </p>
              <p className="text-white text-lg">
                Runtime: {movie.runtime} minutes
              </p>
              {movie.budget ? (
                <p className="text-white text-lg">
                  Budget: {movie.budget.toLocaleString()} $
                </p>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* Right Column - Movie Overview and Additional Information */}
          <div className="lg:w-2/3 lg:pl-8 mt-6">
            <h2 className="text-3xl font-bold mb-4">Overview</h2>
            <p className="mb-6 text-xl">{movie.overview}</p>
            {trailer ? (
              <div className="mb-6">
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${trailer}`}
                  // style={{ height: "inherit" }}  
                  width={"100%"}
                  height={"400px"}
                  volume={0}
                  controls={true}
                  playing
                />
              </div>
            ) : (
              ""
            )}

            <h2 className="text-3xl font-bold mb-4">Additional Information</h2>
            <ul className="mb-6 space-y-2">
              <li>
                <strong className="text-xl">Genres:</strong>{" "}
                {movie.genres.map((genre, index) => (
                  <React.Fragment key={genre.id}>
                    <span className="text-xl">{genre.name}</span>
                    {index !== movie.genres.length - 1 && ", "}
                  </React.Fragment>
                ))}
              </li>
              <li></li>
              <li>
                <strong className="text-xl">Production Companies:</strong>{" "}
                {movie.production_companies.map((company, index) => (
                  <React.Fragment key={company.id}>
                    <span className="text-xl">{company.name}</span>
                    {index !== movie.production_companies.length - 1 && ", "}
                  </React.Fragment>
                ))}
              </li>
              <li>
                <strong className="text-xl">Production Countries:</strong>{" "}
                {movie.production_countries.map((country, index) => (
                  <React.Fragment key={index}>
                    <span className="text-xl">{country.name}</span>
                    {index !== movie.production_countries.length - 1 && ", "}
                  </React.Fragment>
                ))}
              </li>
            </ul>

            {/* Add more sections as needed, like trailers, reviews, similar movies */}
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  const id = context.query.id;

  // Handle the case where the `id` parameter is an array
  const movieId = Array.isArray(id) ? id[0] : id || ""; // Provide a default value for id
  // Fetch movie details based on the `movieId` parameter
  const movie = await requests.fetchMovieDetails(movieId);

  return {
    props: {
      id: movieId,
      movie,
    },
  };
}

export default MoviePage;
