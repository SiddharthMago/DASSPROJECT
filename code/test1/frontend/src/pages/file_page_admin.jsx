import React, { useState, Fragment } from "react";
import "../css/file.css";

function FileVersions() {
	const versions = [
		"Ver 6 - 12/12/2024",
		"Ver 5 - 01/10/2024",
		"Ver 4 - 07/06/2024",
		"Ver 3 - 24/12/2023",
		"Ver 2 - 14/12/2023",
		"Ver 1 - 12/02/2021"
	];

	const [activeButton, setActiveButoon] = useState('');

	const handleClick = (button) => {
		setActiveButoon(button);
	};

	return (
		<section className="file-ver">
			<div className="file-ver-heading">File versions</div>
			<ul>
				{versions.map((version, index) => (
					<li key={index}>
						<button className={activeButton === `div32button${index + 1}` ? 'active' : ''} onClick={() => handleClick(`div32button${index + 1}`)}>{version}</button>
					</li>
				))}
			</ul>
		</section>
	);
}

function FileActions() {
	const handleScroll = () => {
		const targetElement = document.querySelector('.ver-comparison');
		if (targetElement) {
			targetElement.scrollIntoView({ behavior: 'smooth', block: 'start'});
		}
	};

	return (
		<section className="file-actions">
			<h2 className="file-actions-heading">File actions</h2>
			<ul>
				<li>
					<button onClick={handleScroll}>COMPARE VERSIONS</button>
				</li>
				<li>
					<button>PRINT</button>
				</li>
				<li>
					<button>EDIT</button>
				</li>
				<li>
					<button>DELETE</button>
				</li>
			</ul>
		</section>
	);
}

function FileContent() {
	return (
		<article className="file-content">
			<div className="document">
				<h2 className="div46">Lorem Ipsum</h2>
				<p className="div47">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget
					lacus rhoncus, maximus nisl sit amet, gravida lorem. Vestibulum
					viverra scelerisque tellus eget malesuada. Etiam aliquam risus mi, eu
					feugiat lectus malesuada quis. Suspendisse mollis efficitur sem et
					finibus. Vivamus vel ultrices sem, congue pharetra massa. Fusce
					condimentum lacus quis quam tempus gravida a id sapien. Proin semper
					fringilla ipsum at iaculis. Proin ac commodo turpis. Aenean ultricies
					purus sit amet nibh feugiat, ac molestie velit tristique. Pellentesque
					volutpat augue nec metus tincidunt molestie. Duis eget quam est.
					<br />
					<br />
					Fusce dignissim lectus elit, a placerat enim sollicitudin sagittis.
					Aenean id diam at augue rutrum eleifend. Maecenas fermentum vitae
					velit sed tempor. Maecenas eu felis quis nulla suscipit tempor.
					Quisque rutrum fermentum gravida. Phasellus at lacus feugiat,
					pellentesque urna sit amet,
				</p>
			</div>
		</article>
	);
}

function VersionComparison() {
	return (
		<section className="ver-comaprison">
			<VersionOne />
			<VersionTwo />
		</section>
	);
}

function VersionOne() {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedVersion, setSelectedVersion] = useState("Ver 4 - 07/06/2024");

	const versions = [
		"Ver 6 - 12/12/2024",
		"Ver 5 - 01/10/2024",
		"Ver 4 - 07/06/2024",
		"Ver 3 - 24/12/2023",
		"Ver 2 - 14/12/2023",
		"Ver 1 - 12/02/2021"
	];

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const selectVersion = (version) => {
		setSelectedVersion(version);
		setIsOpen(false);
	};

	return (
		<article className="ver1">
			<header>
				<div className="version-dropdown" onClick={toggleDropdown}>
					<span>{selectedVersion}</span>
					<div
						dangerouslySetInnerHTML={{
							__html:
								'<svg id="2156:255" layer-name="mingcute:down-fill" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="down-icon" style="margin: 0; padding: 0; box-sizing: border-box"> <g clip-path="url(#clip0_2156_255)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M18.0599 16.06C17.7787 16.3409 17.3974 16.4987 16.9999 16.4987C16.6024 16.4987 16.2212 16.3409 15.9399 16.06L10.2819 10.404C10.0006 10.1226 9.84268 9.74102 9.84277 9.34316C9.84287 8.9453 10.001 8.56377 10.2824 8.28251C10.5638 8.00125 10.9454 7.84329 11.3433 7.84338C11.7411 7.84348 12.1226 8.00162 12.4039 8.28301L16.9999 12.879L21.5959 8.28301C21.8787 8.00964 22.2575 7.85827 22.6508 7.8615C23.0441 7.86473 23.4204 8.0223 23.6986 8.30028C23.9769 8.57827 24.1348 8.95441 24.1384 9.34771C24.142 9.741 23.991 10.12 23.7179 10.403L18.0609 16.061L18.0599 16.06Z" fill="white"></path> </g> <defs> <clipPath id="clip0_2156_255"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </svg>',
						}}
					/>
				</div>
				<div className={`dropdown-content ${isOpen ? 'show' : ''}`}>
					{versions.map((version, index) => (
						<div
							key={index}
							className="dropdown-item"
							onClick={() => selectVersion(version)}
						>
							{version}
						</div>
					))}
				</div>
			</header>
			<div className="document">
				<h3 className="div52">Lorem Ipsum</h3>
				<p className="div53">
					Lorem ipsum sit amet, consectetur adipiscing elit. Donec eget lacus
					rhoncus,
					<span className="span"> maximus </span>
					nisl sit amet, gravida lorem. Vestibulum viverra scelerisque tellus
					<span className="span2"> eget </span>
					malesuada. Etiam aliquam risus mi, eu feugiat lectus malesuada quis.
					Suspendisse mollis efficitur sem
					<span className="span"> et </span>
					finibus. Vivamus vel ultrices sem, congue pharetra massa. Fusce
					condimentum lacus quis quam tempus gravida a id sapien. Proin semper
					fringilla ipsum at iaculis. Proin ac commodo turpis. Aenean ultricies
					purus sit amet nibh feugiat, ac m
				</p>
			</div>
		</article>
	);
}

function VersionTwo() {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedVersion, setSelectedVersion] = useState("Ver 6 - 12/12/2024");

	const versions = [
		"Ver 6 - 12/12/2024",
		"Ver 5 - 01/10/2024",
		"Ver 4 - 07/06/2024",
		"Ver 3 - 24/12/2023",
		"Ver 2 - 14/12/2023",
		"Ver 1 - 12/02/2021"
	];

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const selectVersion = (version) => {
		setSelectedVersion(version);
		setIsOpen(false);
	};

	return (
		<article className="ver2">
			<header>
				<div className="version-dropdown" onClick={toggleDropdown}>
					<span>{selectedVersion}</span>
					<div>
						<div
							dangerouslySetInnerHTML={{
								__html:
									'<svg id="2156:259" layer-name="mingcute:down-fill" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="down-icon" style="margin: 0; padding: 0; box-sizing: border-box"> <g clip-path="url(#clip0_2156_259)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.0599 16.06C12.7787 16.3409 12.3974 16.4987 11.9999 16.4987C11.6024 16.4987 11.2212 16.3409 10.9399 16.06L5.2819 10.404C5.00064 10.1226 4.84268 9.74102 4.84277 9.34316C4.84287 8.9453 5.00101 8.56377 5.2824 8.28251C5.56379 8.00125 5.9454 7.84329 6.34325 7.84338C6.74111 7.84348 7.12264 8.00162 7.4039 8.28301L11.9999 12.879L16.5959 8.28301C16.8787 8.00964 17.2575 7.85827 17.6508 7.8615C18.0441 7.86473 18.4204 8.0223 18.6986 8.30028C18.9769 8.57827 19.1348 8.95441 19.1384 9.34771C19.142 9.741 18.991 10.12 18.7179 10.403L13.0609 16.061L13.0599 16.06Z" fill="white"></path> </g> <defs> <clipPath id="clip0_2156_259"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </svg>',
							}}
						/>
					</div>
				</div>
				<div className={`dropdown-content ${isOpen ? 'show' : ''}`}>
					{versions.map((version, index) => (
						<div
							key={index}
							className="dropdown-item"
							onClick={() => selectVersion(version)}
						>
							{version}
						</div>
					))}
				</div>
			</header>
			<div className="document">
				<h3 className="div57">Lorem Ipsum</h3>
				<p className="div58">
					Lorem ipsum
					<span className="span3"> dolor </span>
					sit amet, consectetur adipiscing elit. Donec eget lacus rhoncus, nisl
					sit amet, gravida lorem. Vestibulum viverra scelerisque tellus
					<span className="span4"> egt </span>
					malesuada. Etiam aliquam risus mi, eu feugiat lectus malesuada quis.
					Suspendisse mollis efficitur sem finibus. Vivamus vel ultrices sem,
					congue pharetra massa. Fusce condimentum lacus quis quam tempus
					gravida a id sapien. Proin semper fringilla ipsum at iaculis. Proin ac
					commodo turpis. Aenean ultricies purus sit amet nibh feugiat, ac m
					<span className="span5">olestie velit. </span>
				</p>
			</div>
		</article>
	);
}

function FilePageAdmin({ darkMode }) {
	return (
		<Fragment>
			<div className={`file-container ${darkMode ? 'dark-mode' : ''}`}>
				<link
					href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap"
					rel="stylesheet"
				/>
				<section className="view-file">
					<aside className="side-menu">
						<FileVersions />
						<FileActions />
					</aside>
					<FileContent />
				</section>
				<VersionComparison />
			</div>
		</Fragment>
	);
}

export default FilePageAdmin;
